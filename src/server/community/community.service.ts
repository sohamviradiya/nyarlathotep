import AdminApp from "@/server/firebase/admin.init";
import { Service_Response, STATUS_CODES } from "@/server/response/response.module";
import { castToUser } from "@/server/user/user.util";
import {
    Announcement,
    Announcement_Document,
    Announcement_Input,
    Community_Input,
    Community_Private,
    Community_Public,
    MEMBER_ROLE,
    MEMBER_ROLE_TYPE
} from "@/server/community/community.module";
import { castToAnnouncement, castToCommunity, castToCommunityPrivate, checkModerationAccess, generateHexString } from "@/server/community/community.util";
import { DocumentReference, FieldValue, Timestamp } from "firebase-admin/firestore";
import { sendAppeal } from "../appeal/appeal.service";
import { APPEAL_TYPE, Appeal } from "../appeal/appeal.module";
import { verifyClientToken } from "../auth/auth.service";

const {
    CommunityCollection,
    UserCollection,
    AnnouncementCollection
} = AdminApp;

export async function searchCommunitiesByName(search_string: string, limit: number): Promise<Service_Response<null | { communities: Community_Public[] }>> {
    const documents = await CommunityCollection
        .where("name", ">=", search_string)
        .where("name", "<=", search_string + "\uf8ff")
        .limit(limit)
        .select("id", "name", "description", "founded")
        .get();
    if (documents.empty) {
        return {
            code: STATUS_CODES.NOT_FOUND,
            message: `No communities found for ${search_string}`,
        };
    }
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
    const community_list = user.communities;
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
    const community_document = await communityRef.get();
    if (!community_document.exists) {
        return {
            code: STATUS_CODES.NOT_FOUND,
            message: `No community found for ${community_id}`
        };
    }
    return {
        code: STATUS_CODES.OK,
        message: `Community found for ${community_id}`,
        data: {
            community: castToCommunity(community_document)
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

    const role_service_response = await getMemberRole(community, auth_service_response.data.email);
    if (!role_service_response.data) return role_service_response as Service_Response<null>;

    if (role_service_response.data.role == MEMBER_ROLE.PARTICIPANT) {
        return await sendAppeal({
            message: announcement.content,
            type: APPEAL_TYPE.ANNOUNCE,
            receiver: community_id
        }, token)
    }
    if (role_service_response.data.role == MEMBER_ROLE.BANNED) {
        return {
            code: STATUS_CODES.FORBIDDEN,
            message: `You are not allowed to post announcements in community ${community.name}`,
        }
    }
    const id = `${community.id}.${Timestamp.now().seconds}`;
    await AnnouncementCollection.doc(id).set({
        id,
        content: announcement.content,
        user: userRef,
        time: Timestamp.now()
    });
    communityRef.update({
        announcements: FieldValue.arrayUnion(AnnouncementCollection.doc(id))
    });

    return {
        code: STATUS_CODES.OK,
        message: `Announcement posted in community ${community.name}`,
        data: {
            announcement: castToAnnouncement(await AnnouncementCollection.doc(id).get())
        }
    }
}

export async function getMemberRole(community: Community_Private, user_id: string): Promise<Service_Response<null | { role: MEMBER_ROLE_TYPE }>> {
    const member = community.members.find(member => member.user == user_id);
    if (!member) {
        return {
            code: STATUS_CODES.UNAUTHORIZED,
            message: `You are not member of community ${community.name}`,
        }
    }
    const role = member.role;
    return {
        code: STATUS_CODES.OK,
        message: `User role in community ${community.name}`,
        data: {
            role,
        }
    }
}

export async function getCommunityAnnouncements(id: string, token: string) {
    const communityDoc = await CommunityCollection.doc(id).get();
    const community = castToCommunityPrivate(communityDoc);
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
    const role_service_response = await getMemberRole(community, auth_service_response.data.email);
    if (!role_service_response.data) return role_service_response as Service_Response<null>;
    const announcements =  await Promise.all(communityDoc.data()?.announcements.map(async (announcement: DocumentReference) => {
        return castToAnnouncement(await announcement.get());
    }));
    return {
        code: STATUS_CODES.OK,
        message: `Announcements found for community ${id}`,
        data: {
            announcements,
        }
    };
}

export async function getCommunityModerators(id: string, token: string) {
    const community = castToCommunityPrivate(await CommunityCollection.doc(id).get());
    const role_service_response = await getMemberRole(community, token);
    if (!role_service_response.data) return role_service_response as Service_Response<null>;
    const moderators = community.members.filter(member => member.role == MEMBER_ROLE.MODERATOR);
    return {
        code: STATUS_CODES.OK,
        message: `Moderators found for community ${id}`,
        data: {
            moderators,
        }
    };
}

export async function checkModerationAccessWithToken(community: Community_Private, token: string): Promise<Service_Response<null | { role: MEMBER_ROLE_TYPE }>> {
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
    return await checkModerationAccess(community, auth_service_response.data.email);
}

