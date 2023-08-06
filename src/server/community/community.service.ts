import { CommunityCollection, UserCollection, AnnouncementCollection } from "@/server/firebase/admin.init";
import { Service_Response, STATUS_CODES } from "@/server/response/response.module";
import { castToUser } from "@/server/user/user.util";
import { Announcement, Announcement_Input, Community_Input, Community_Private, Community_Public, Member_Document, MEMBER_ROLE, MEMBER_ROLE_TYPE } from "@/server/community/community.module";
import { castToAnnouncement, castToCommunity, castToCommunityPrivate, checkModerationAccess, getMemberRole } from "@/server/community/community.util";
import { DocumentReference, FieldValue, Timestamp } from "firebase-admin/firestore";
import { sendAppeal } from "@/server/appeal/appeal.service";
import { APPEAL_TYPE_ENUM, Appeal } from "@/server/appeal/appeal.module";
import { verifyClientToken } from "@/server/auth/auth.service";
import { Forbidden } from "@/server/response/response.util";


export async function searchCommunitiesByName(search_string: string, limit: number): Promise<Service_Response<null | { communities: Community_Public[] }>> {
    const documents = await CommunityCollection
        .where("name", ">=", search_string)
        .where("name", "<=", search_string + "\uf8ff")
        .limit(limit)
        .select("id", "name", "description", "founded")
        .get();
    const communities = documents.docs.map((document) => castToCommunity(document)) as Community_Public[];
    return {
        code: STATUS_CODES.OK,
        message: `Communities found for ${search_string}`,
        data: {
            communities,
        }
    };
}

export async function getUserCommunities(user_id: string): Promise<Service_Response<null | {
    communities: Community_Public[]
}>> {
    const document = await UserCollection.doc(user_id).get();
    if (!document.exists) {
        return {
            code: STATUS_CODES.NOT_FOUND,
            message: `No user found for ${user_id}`,
        };
    }
    const user = castToUser(document);
    const community_list = user.communities as string[];
    const community_details = await Promise.all(
        community_list.map(async (community_id) => {
            return await CommunityCollection.doc(community_id).get();
        })
    );
    return {
        code: STATUS_CODES.OK,
        message: `Communities found for ${user.email}`,
        data: {
            communities: community_details.map((community) => castToCommunity(community)) as Community_Public[],
        }
    }
};

export async function getCommunityByID(community_id: string): Promise<Service_Response<null | {
    community: Community_Public
}>> {
    const communityRef = await CommunityCollection.doc(community_id);
    const communityDoc = await communityRef.get();
    if (!communityDoc.exists) {
        return {
            code: STATUS_CODES.NOT_FOUND,
            message: `No community found for ${community_id}`
        };
    }
    const community = castToCommunity(communityDoc);
    const members = await Promise.all(
        communityDoc.data()?.members.map(async (member: Member_Document) => {
            const user = await member.user.get();
            return {
                user: castToUser(user),
                role: member.role
            };
        }));

    return {
        code: STATUS_CODES.OK,
        message: `Community found for ${community_id}`,
        data: {
            community: {
                ...community,
                members
            }
        }
    }
}

export async function createCommunity(community: Community_Input, token: string): Promise<Service_Response<null | {
    community: Community_Private
}>> {
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data)
        return auth_service_response as Service_Response<null>;
    const userRef = await UserCollection.doc(auth_service_response.data.email);
    const communityRef = await CommunityCollection.add({
        name: community.name,
        description: community.description,
        members: [{
            user: userRef,
            role: MEMBER_ROLE.ADMIN
        }],
        founded: Timestamp.now(),
        appeals: [],
        announcements: [],
    });
    await userRef.update({
        communities: FieldValue.arrayUnion(communityRef)
    });
    const community_document = await communityRef.get();
    return {
        code: STATUS_CODES.OK,
        message: `${community.name} created`,
        data: {
            community: castToCommunityPrivate(community_document)
        }
    }
};

export async function updateCommunity(community: Community_Public, token: string): Promise<Service_Response<null | {
    community: Community_Private
}>> {
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data)
        return auth_service_response as Service_Response<null>;
    const communityRef = await CommunityCollection.doc(community.id);
    const community_document = castToCommunityPrivate(await communityRef.get());
    const access_service_response = await checkModerationAccess(community_document, auth_service_response.data.email);
    if (!access_service_response.data) return access_service_response as Service_Response<null>;
    await communityRef.update(community);
    return {
        code: STATUS_CODES.OK,
        message: `Community ${community.name} updated`,
        data: {
            community: community_document
        }
    }
};

export async function announceInCommunity(announcement: Announcement_Input, token: string, community_id: string): Promise<Service_Response<null | { appeal: Appeal } | { announcement: Announcement }>> {
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data)
        return auth_service_response as Service_Response<null>;
    const userRef = await UserCollection.doc(auth_service_response.data.email);
    const communityRef = await CommunityCollection.doc(community_id);
    const community = castToCommunityPrivate(await communityRef.get());

    const role_service_response = getMemberRole(community, auth_service_response.data.email);
    if (!role_service_response.data) return role_service_response as Service_Response<null>;

    if (role_service_response.data.role == MEMBER_ROLE.PARTICIPANT) {
        return await sendAppeal({
            message: announcement.content,
            type: APPEAL_TYPE_ENUM.ANNOUNCE,
            receiver: community_id
        }, token)
    }
    if (role_service_response.data.role == MEMBER_ROLE.BANNED)
        return Forbidden({ message: `You are not allowed to post announcements in community ${community.name}`, });

    const id = `${community.id}.${Timestamp.now().seconds}`;
    await AnnouncementCollection.doc(id).set({
        id,
        content: announcement.content,
        user: userRef,
        time: Timestamp.now()
    });
    const announcementRef = AnnouncementCollection.doc(id);
    communityRef.update({
        announcements: FieldValue.arrayUnion(announcementRef)
    });

    return {
        code: STATUS_CODES.OK,
        message: `Announcement posted in community ${community.name}`,
        data: {
            announcement: castToAnnouncement(await announcementRef.get())
        }
    }
}


export async function getCommunityAnnouncements(id: string, token: string) {
    const communityDoc = await CommunityCollection.doc(id).get();
    const community = castToCommunityPrivate(communityDoc);
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
    const role_service_response = getMemberRole(community, auth_service_response.data.email);
    if (!role_service_response.data) return role_service_response as Service_Response<null>;
    const announcements = await Promise.all(communityDoc.data()?.announcements.map(async (announcement: DocumentReference) => {
        return castToAnnouncement(await announcement.get());
    })) as Announcement[];
    return {
        code: STATUS_CODES.OK,
        message: `Announcements found for community ${id}`,
        data: {
            announcements: announcements.sort((a, b) => Number(b.time) - Number(a.time))
        }
    };
}

export async function getCommunityAppeals(id: string, token: string) {
    const communityDoc = await CommunityCollection.doc(id).get();

    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
    const community = castToCommunityPrivate(communityDoc);
    const role_service_response = getMemberRole(community, auth_service_response.data.email);
    if (!role_service_response.data) return role_service_response as Service_Response<null>;

    if (role_service_response.data.role == MEMBER_ROLE.PARTICIPANT) return Forbidden({ message: `You are not allowed to view appeals in community ${community.name}`, });

    return {
        code: STATUS_CODES.OK,
        message: `Appeals found for community ${id}`,
        data: {
            appeals: community.appeals
        }
    };
};

export async function getMemberRoleWithToken(id: string, token: string) {
    const community = castToCommunityPrivate(await CommunityCollection.doc(id).get());
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
    return getMemberRole(community, auth_service_response.data.email);
}

export async function checkModerationAccessWithToken(community: Community_Private, token: string): Promise<Service_Response<null | { role: MEMBER_ROLE_TYPE }>> {
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
    return await checkModerationAccess(community, auth_service_response.data.email);
}

