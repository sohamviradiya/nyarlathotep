import { adminDb } from "../firebase/admin.init";
import { Protocol, STATUS_CODE } from "../util/protocol.module";
import { castToUser } from "../user/user.module";
import { castToCommunity } from "../community/community.module";
const UserCollection = adminDb.collection("Users");
const CommunityCollection = adminDb.collection("Communities");

export async function getUserCommunities(user_id: string): Promise<Protocol> {
	try {
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
			data: community_details.map((community) => castToCommunity(community)),
		};
	} catch (error) {
		console.log(error);
		return {
			code: STATUS_CODE.INTERNAL_ERROR,
			message: "Unable to get user",
			data: null,
		};
	}
};
