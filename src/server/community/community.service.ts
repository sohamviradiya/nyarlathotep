import { UserCollection, CommunityCollection } from "@/server/firebase/admin.init";
import { Service_Response, STATUS_CODE } from "@/server/util/protocol.module";
import { castToUser } from "@/server/user/user.module";
import { Community_Public, castToCommunity } from "@/server/community/community.module";

export async function getUserCommunities(user_id: string): Promise<Service_Response<null | {
    communities: Community_Public[]
}>> {
    const document = await UserCollection.doc(user_id).get();
    if (!document.exists) {
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: `No user found for ${user_id}`,
            data: null,
        };
    }
    const user = castToUser(document);
    const community_list = user.communities;
    if (community_list.length == 0)
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: `User ${user.email} is not a member of any community`,
            data: null,
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
