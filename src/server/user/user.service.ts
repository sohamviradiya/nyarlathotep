import { adminAuth, UserCollection } from "@/server/firebase/admin.init";
import { Service_Response, STATUS_CODE } from "@/server/response/response.module";
import {
    User_Input,
    User_Private,
    User_Public,
} from "@/server/user/user.module";
import {
    castInputToUser,
    castToProfile,
    castToUser,
    castToUsers
} from "@/server/user/user.util";
import { getUserIDFromToken } from "@/server/auth/auth.service";

export async function searchUsersByName(search_string: string): Promise<Service_Response<null | { users: User_Public[] }>> {
    const documents = await UserCollection.orderBy("name")
        .where("name", ">=", search_string)
        .where("name", "<=", search_string + "\uf8ff")
        .limit(25)
        .get();
    if (documents.empty) {
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: `No users found for ${search_string}`,
        };
    }
    const users = castToUsers(documents);
    return {
        code: STATUS_CODE.OK,
        message: `Users found for ${search_string}`,
        data: {
            users,
        },
    }
}

export async function getProfileFromToken(token: string): Promise<Service_Response<null | { user: User_Private }>> {
    const auth_service_response = await getUserIDFromToken(token);
    if (!auth_service_response.data)
        return auth_service_response as Service_Response<null>;
    const document = await UserCollection.doc(auth_service_response.data.id).get();
    if (!document.exists) {
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: `No user found for ${auth_service_response.data.id}`,
        };
    }
    const user: User_Private = castToProfile(document);
    return {
        code: STATUS_CODE.OK,
        message: `User found for ${auth_service_response.data.id}`,
        data: {
            user
        },
    }
}

export async function addUser(input: Omit<User_Input, "joined">): Promise<Service_Response<null | { user: User_Private }>> {
    if (!input.name || !input.email) {
        return {
            code: STATUS_CODE.BAD_REQUEST,
            message: "Name, email and  are required",
        };
    }
    if (!input.bio) input.bio = "";
    if (!input.address) input.address = "";
    const user = castInputToUser({ ...input, joined: new Date() });
    const document = await (await UserCollection.add(user)).get();
    const new_user: User_Private = castToProfile(document);
    return {
        code: STATUS_CODE.OK,
        message: `User added with id ${document.id}`,
        data: {
            user: new_user,
        },
    }
}

export async function updateUser(input: User_Input, token: string): Promise<Service_Response<null | { user: User_Private }>> {
    const auth_service_response = await getUserIDFromToken(token);
    if (!auth_service_response.data)
        return auth_service_response as Service_Response<null>;
    const userRef = await UserCollection.doc(auth_service_response.data.id);
    if (!userRef) {
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: "User not found",
        };
    }
    await userRef.update(input);
    const new_user = castToProfile(await userRef.get());
    return {
        code: STATUS_CODE.OK,
        message: `User updated with email ${input.email}`,
        data: {
            user: new_user,
        },
    };
}

export async function deleteUser(token: string): Promise<Service_Response<null>> {
    const auth_service_response = await getUserIDFromToken(token);
    if (!auth_service_response.data)
        return auth_service_response as Service_Response<null>;
    const userRef = await UserCollection.doc(auth_service_response.data.id);

    await userRef.delete();
    await adminAuth.deleteUser(auth_service_response.data.uid);
    return {
        code: STATUS_CODE.OK,
        message: `User deleted with id ${auth_service_response.data.id}`,
    };
}

export async function getUser(user_id: string): Promise<Service_Response<null | { user: User_Public }>> {
    const document = await UserCollection.doc(user_id).get();
    if (!document.exists) {
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: `No user found for ${user_id}`,
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
}

