import { UserCollection, CommunityCollection } from "@/server/firebase/admin.init";
import { Service_Response, STATUS_CODE } from "@/server/response/response.module";
import { castToUser } from "@/server/user/user.util";
import {
    Announcement,
    Community_Input,
    Community_Private,
    Community_Public,
    MEMBER_ROLE,
    MEMBER_ROLE_TYPE
} from "@/server/community/community.module";
import { castToCommunity, castToCommunityPrivate, checkModerationAccess } from "@/server/community/community.util";
import { getUserIDFromToken } from "@/server/auth/auth.service";

export async function getUserCommunities(user_id: string): Promise<Service_Response<null | {
    communities: Community_Public[]
}>> {
    const document = await UserCollection.doc(user_id).get();
    if (!document.exists) {
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: `No user found for ${user_id}`,
        };
    }
    const user = castToUser(document);
    const community_list = user.communities;
    if (community_list.length == 0)
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: `User ${user.email} is not a member of any community`,
        };
    const community_details = await Promise.all(
        community_list.map(async (community_id) => {
            return await CommunityCollection.doc(community_id).get();
        })
    );
    return {
        code: STATUS_CODE.OK,
        message: `Communities found for ${user.email}`,
        data: {
            communities: community_details.map((community) => castToCommunity(community)) as Community_Public[],
        }
    }
};

export async function getCommunity(community_id: string): Promise<Service_Response<null | {
    community: Community_Public
}>> {
    const communityRef = await CommunityCollection.doc(community_id);
    const community_document = await communityRef.get();
    if (!community_document.exists) {
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: `No community found for ${community_id}`
        };
    }
    return {
        code: STATUS_CODE.OK,
        message: `Community found for ${community_id}`,
        data: {
            community: castToCommunity(community_document)
        }
    }
}

export async function createCommunity(community: Community_Input, token: string): Promise<Service_Response<null | {
    community: Community_Private
}>> {
    const auth_service_response = await getUserIDFromToken(token);
    if (!auth_service_response.data)
        return auth_service_response as Service_Response<null>;
    const userRef = await UserCollection.doc(auth_service_response.data.id);

    const community_input = {
        ...community,
        founded: new Date(),
        requests: [],
        announcements: [],
        members: [{
            user: userRef,
            role: MEMBER_ROLE.ADMIN
        }]
    };
    const communityRef = await CommunityCollection.add(community_input);
    const community_document = await communityRef.get();
    return {
        code: STATUS_CODE.OK,
        message: `Community ${community.name} created`,
        data: {
            community: castToCommunityPrivate(community_document)
        }
    }
};

export async function updateCommunity(community: Community_Public, token: string): Promise<Service_Response<null | {
    community: Community_Private
}>> {
    const auth_service_response = await getUserIDFromToken(token);
    if (!auth_service_response.data)
        return auth_service_response as Service_Response<null>;
    const communityRef = await CommunityCollection.doc(community.id);
    const community_document = castToCommunityPrivate(await communityRef.get());
    const access_service_response = await checkModerationAccess(community_document, auth_service_response.data.id);
    if (!access_service_response.data) return access_service_response as Service_Response<null>;
    await communityRef.update(community);
    return {
        code: STATUS_CODE.OK,
        message: `Community ${community.name} created`,
        data: {
            community: community_document
        }
    }
};

export async function announceInCommunity(announcement: Announcement, token: string, community_id: string): Promise<Service_Response<null>> {
    const auth_service_response = await getUserIDFromToken(token);
    if (!auth_service_response.data)
        return auth_service_response as Service_Response<null>;
    const communityRef = await CommunityCollection.doc(community_id);
    const community = castToCommunityPrivate(await communityRef.get());
    const access_service_response = await checkModerationAccess(community, auth_service_response.data.id);
    if (!access_service_response.data) return access_service_response as Service_Response<null>;
    communityRef.update({
        announcements: [...community.announcements, {
            ...announcement,
            date: new Date(),
            user: await UserCollection.doc(auth_service_response.data.id)
        }]
    });
    return {
        code: STATUS_CODE.OK,
        message: `Announcement posted in community ${community.name}`,
    };
}

export async function getMemberRole(community: Community_Private, user_id: string): Promise<Service_Response<null | { role: MEMBER_ROLE_TYPE }>> {
    const member = community.members.find(member => member.user == user_id);
    if (!member) {
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: `User ${user_id} is not a member of community ${community.name}`,
        }
    }
    const role = member.role;
    return {
        code: STATUS_CODE.OK,
        message: `User role in community ${community.name}`,
        data: {
            role,
        }
    }
}

export async function checkModerationAccessWithToken(community: Community_Private, token: string): Promise<Service_Response<null | { role: MEMBER_ROLE_TYPE }>> {
    const auth_service_response = await getUserIDFromToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
    return await checkModerationAccess(community, auth_service_response.data.id);
}

