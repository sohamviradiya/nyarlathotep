import { verifyClientToken } from "../auth/auth.service";
import { adminAuth, adminDb } from "../firebase/admin.init";
import { Protocol, STATUS_CODE } from "../util/protocol.module";
import {
	castInputToUser,
	castToProfile,
	castToUser,
	castToUsers,
	User_Input,
	User_Private,
} from "./user.module";
import { castToCommunity } from "../community/community.module";
const UserCollection = adminDb.collection("Users");
const CommunityCollection = adminDb.collection("Communities");
export const RequestCollection = adminDb.collection("Requests");

export async function searchUsers(search_string: string): Promise<Protocol> {
	try {
		console.log(search_string);
		const documents = await UserCollection.orderBy("name")
			.limit(25)
			.where("name", ">=", search_string)
			.where("name", "<=", search_string + "\uf8ff")
			.get();
		if (documents.empty) {
			return {
				code: STATUS_CODE.NOT_FOUND,
				message: `No users found for ${search_string}`,
				data: null,
			};
		}
		const users = castToUsers(documents);
		return {
			code: STATUS_CODE.OK,
			message: `Users found for ${search_string}`,
			data: {
				users,
			},
		};
	} catch (error) {
		console.log(error);
		return {
			code: STATUS_CODE.INTERNAL_ERROR,
			message: "Unable to search user",
			data: null,
		};
	}
}

export async function getProfile(token: string): Promise<Protocol> {
	try {
		const verification = await verifyClientToken(token);
		if (verification.code != STATUS_CODE.OK) {
			return verification;
		}
		const email: string = verification.data.email;
		const document = await UserCollection.where("email", "==", email).limit(1).get();
		if (document.empty) {
			return {
				code: STATUS_CODE.NOT_FOUND,
				message: `No user found for ${email}`,
				data: null,
			};
		}
		const user: User_Private = castToProfile(document.docs[0]);
		return {
			code: STATUS_CODE.OK,
			message: `User found for ${email}`,
			data: {
				...user,
			},
		};
	} catch (error) {
		console.log(error);
		return {
			code: STATUS_CODE.INTERNAL_ERROR,
			message: "Unable to get user",
			data: null,
		};
	}
}

export async function addUser(input: Omit<User_Input, "joined">): Promise<Protocol> {
	try {
		if (!input.name || !input.email) {
			return {
				code: STATUS_CODE.BAD_REQUEST,
				message: "Name, email and  are required",
				data: null,
			};
		}
		if (!input.bio) input.bio = "";
		if (!input.address) input.address = "";
		const user = castInputToUser({ ...input, joined: new Date() });
		const document = await (await UserCollection.add(user)).get();
		const newuser: User_Private = castToProfile(document);
		return {
			code: STATUS_CODE.OK,
			message: `User added with id ${document.id}`,
			data: {
				...newuser,
			},
		};
	} catch (error) {
		console.log(error);
		return {
			code: STATUS_CODE.INTERNAL_ERROR,
			message: "Unable to add user",
			data: null,
		};
	}
}

export async function updateUser(input: User_Input, token: string): Promise<Protocol> {
	try {
		const verification = await verifyClientToken(token);
		if (verification.code != STATUS_CODE.OK) {
			return verification;
		}
		const email = verification.data.email;
		const user_doc = await UserCollection.where("email", "==", email).limit(1).get();
		if (user_doc.empty) {
			return {
				code: STATUS_CODE.NOT_FOUND,
				message: "User not found",
				data: null,
			};
		}
		const user_id = user_doc.docs[0].id;
		input.email = email;
		await UserCollection.doc(user_id).update(input);
		const newuser: User_Private = castToProfile(await UserCollection.doc(user_id).get());
		return {
			code: STATUS_CODE.OK,
			message: `User updated with email ${input.email}`,
			data: {
				...newuser,
			},
		};
	} catch (error) {
		console.log(error);
		return {
			code: STATUS_CODE.INTERNAL_ERROR,
			message: "Unable to update user",
			data: null,
		};
	}
}

export async function deleteUser(token: string): Promise<Protocol> {
	try {
		const verification = await verifyClientToken(token);
		if (verification.code != STATUS_CODE.OK) {
			return verification;
		}
		const email = verification.data.email;
		const user_doc = await UserCollection.where("email", "==", email).limit(1).get();
		if (user_doc.empty) {
			return {
				code: STATUS_CODE.NOT_FOUND,
				message: "User not found",
				data: null,
			};
		}
		const user_id = user_doc.docs[0].id;
		await UserCollection.doc(user_id).delete();
		await adminAuth.deleteUser(verification.data.uid);
		return {
			code: STATUS_CODE.OK,
			message: `User deleted with email ${email}`,
			data: null,
		};
	} catch (error) {
		console.log(error);
		return {
			code: STATUS_CODE.INTERNAL_ERROR,
			message: "Unable to delete user",
			data: null,
		};
	}
}

export async function getUser(user_id: string): Promise<Protocol> {
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
		return {
			code: STATUS_CODE.OK,
			message: `User found ${user.email}`,
			data: {
				...user,
			},
		};
	} catch (error) {
		console.log(error);
		return {
			code: STATUS_CODE.INTERNAL_ERROR,
			message: "Unable to get user",
			data: null,
		};
	}
}

