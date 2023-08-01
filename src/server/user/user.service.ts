import AdminApp from "@/server/firebase/admin.init";
import { Service_Response, STATUS_CODES } from "@/server/response/response.module";
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
import { Timestamp } from "firebase-admin/firestore";
import { addCredentials, verifyClientToken } from "../auth/auth.service";
import { Appeal } from "../appeal/appeal.module";
import { castToAppeal } from "../appeal/appeal.util";
import { Contact } from "../contact/contact.module";
import { castToContact } from "../contact/contact.util";
import { castToCommunity } from "../community/community.util";
import { Community_Public } from "../community/community.module";

const {
    UserCollection,
    adminAuth,
} = AdminApp;

export async function searchUsersByName(search_string: string, limit: number): Promise<Service_Response<null | { users: User_Public[] }>> {
    const documents = await AdminApp.UserCollection
        .where("name", ">=", search_string)
        .where("name", "<=", search_string + "\uf8ff")
        .limit(limit)
        .select("id", "name", "email", "bio", "address", "joined", "communities", "last_online")
        .get();
    if (documents.empty) {
        return {
            code: STATUS_CODES.NOT_FOUND,
            message: `No users found for ${search_string}`,
        };
    }
    const users = castToUsers(documents);
    return {
        code: STATUS_CODES.OK,
        message: `Users found for ${search_string}`,
        data: {
            users,
        },
    }
}

export async function getProfileFromToken(token: string): Promise<Service_Response<null | { user: User_Private }>> {
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data)
        return auth_service_response as Service_Response<null>;
    const document = await AdminApp.UserCollection.doc(auth_service_response.data.email).get();
    
    
    
    const communities = await Promise.all((document.data()?.communities as FirebaseFirestore.DocumentReference[]).map(async (ref) => {
        return castToCommunity(await ref.get());
    })) as Community_Public[];

    const user: User_Private = castToProfile(document);
    return {
        code: STATUS_CODES.OK,
        message: `User found for ${auth_service_response.data.email}`,
        data: {
            user: {
                ...user,
                communities,
            },
        },
    }
}

export async function getAppealsFromToken(token: string): Promise<Service_Response<null | { appeals: Appeal[] }>> {
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data)
        return auth_service_response as Service_Response<null>;
    const document = await AdminApp.UserCollection.doc(auth_service_response.data.email).get();
    if (!document.exists)
        return {
            code: STATUS_CODES.NOT_FOUND,
            message: `No user found for ${auth_service_response.data.email}`,
        };
    const appeal_refs = document.data()?.invitations as FirebaseFirestore.DocumentReference[];
    const appeals = await Promise.all(appeal_refs.map(async (ref) => {
        const appeal = castToAppeal(await ref.get());
        return appeal;
    }));
    return {
        code: STATUS_CODES.OK,
        message: `Found appeals for ${auth_service_response.data.email}`,
        data: {
            appeals,
        }
    };
}

export async function getContactsFromToken(token: string): Promise<Service_Response<null | { contacts: Contact[] }>> {
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data)
        return auth_service_response as Service_Response<null>;
    const document = await AdminApp.UserCollection.doc(auth_service_response.data.email).get();
    if (!document.exists)
        return {
            code: STATUS_CODES.NOT_FOUND,
            message: `No user found for ${auth_service_response.data.email}`,
        };
    const contact_refs = document.data()?.contacts as FirebaseFirestore.DocumentReference[];
    const contacts = await Promise.all(contact_refs.map(async (ref) => {
        const contact = castToContact(await ref.get());
        return contact;
    }));
    return {
        code: STATUS_CODES.OK,
        message: `Found contacts for ${auth_service_response.data.email}`,
        data: {
            contacts,
        }
    };
}


export async function addUser(input: User_Input): Promise<Service_Response<null | { user: User_Private }>> {
    const credentials_service_response = await addCredentials({
        email: input.email,
        password: input.password,
    });
    if (!credentials_service_response.data)
        return credentials_service_response as Service_Response<null>;
    const user = castInputToUser(input);
    await AdminApp.UserCollection.doc(user.email).set({
        ...user,
        joined: Timestamp.now(),
        last_online: Timestamp.now(),
    });
    const document = await AdminApp.UserCollection.doc(user.email).get();
    const new_user: User_Private = castToProfile(document);
    return {
        code: STATUS_CODES.OK,
        message: `User added with id ${document.id}`,
        data: {
            user: new_user,
        },
    }
}

export async function updateUser(input: User_Input, token: string): Promise<Service_Response<null | { user: User_Private }>> {
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data)
        return auth_service_response as Service_Response<null>;
    const userRef = await AdminApp.UserCollection.doc(auth_service_response.data.email);
    if (!userRef) {
        return {
            code: STATUS_CODES.NOT_FOUND,
            message: "User not found",
        };
    }
    await userRef.update(input);
    const new_user = castToProfile(await userRef.get());
    return {
        code: STATUS_CODES.OK,
        message: `User updated with email ${input.email}`,
        data: {
            user: new_user,
        },
    };
}

export async function deleteUser(token: string): Promise<Service_Response<null>> {
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data)
        return auth_service_response as Service_Response<null>;
    const userRef = await AdminApp.UserCollection.doc(auth_service_response.data.email);
    await userRef.delete();
    await adminAuth.deleteUser(auth_service_response.data.uid);
    return {
        code: STATUS_CODES.OK,
        message: `User deleted with id ${auth_service_response.data.email}`,
    };
}

export async function getUserByID(id: string): Promise<Service_Response<null | { user: User_Public }>> {
    const document = await AdminApp.UserCollection.doc(id).get();
    if (!document.exists) {
        return {
            code: STATUS_CODES.NOT_FOUND,
            message: `No user found for ${id}`,
        };
    }
    const communities = await Promise.all((document.data()?.communities as FirebaseFirestore.DocumentReference[]).map(async (ref) => {
        return castToCommunity(await ref.get());
    })) as Community_Public[];
    const user = castToUser(document);
    return {
        code: STATUS_CODES.OK,
        message: `User found ${user.email}`,
        data: {
            user: {
                ...user,
                communities,
            }
        }
    };
}
