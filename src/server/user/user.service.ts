import { verifyClientToken } from "@/server/auth/auth.service";
import { adminAuth, UserCollection } from "@/server/firebase/admin.init";
import { Service_Response, STATUS_CODE } from "@/server/util/protocol.module";
import {
	castInputToUser,
	castToProfile,
	castToUser,
	castToUsers,
	User_Input,
	User_Private,
    User_Public,
} from "./user.module";

export async function searchUsersByName(search_string: string): Promise<Service_Response<null | { users: User_Public[] }>> {
	try {
		console.log(search_string);
		const documents = await UserCollection.orderBy("name")
			.where("name", ">=", search_string)
            .where("name", "<=", search_string + "\uf8ff")
            .limit(25)
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

export async function getProfileFromToken(token: string): Promise<Service_Response<null | {
    user: User_Private
}>> {
	try {
		const verification = await verifyClientToken(token);
		if (!verification.data)
			return verification as Service_Response<null>;
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
				user
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

export async function addUser(input: Omit<User_Input, "joined">): Promise<Service_Response<null|{user: User_Private}>> {
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
				user: newuser,
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

export async function updateUser(input: User_Input, token: string): Promise<Service_Response<null|{user: User_Private}>> {
	try {
		const verification = await verifyClientToken(token);
		if (!verification.data)
			return verification as Service_Response<null>;
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
		const newuser = castToProfile(await UserCollection.doc(user_id).get());
		return {
			code: STATUS_CODE.OK,
			message: `User updated with email ${input.email}`,
			data: {
				user: newuser,
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

export async function deleteUser(token: string): Promise<Service_Response<null>> {
	try {
		const verification = await verifyClientToken(token);
		if (!verification.data) {
			return verification as Service_Response<null>;
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

export async function getUser(user_id: string): Promise<Service_Response<null | { user: User_Public }>> {
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
				user,
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

