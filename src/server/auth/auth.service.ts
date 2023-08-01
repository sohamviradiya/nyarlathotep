import {
    createUserWithEmailAndPassword,
    signInWithCustomToken,
    signOut,
    updatePassword,
    UserCredential,
} from "firebase/auth";
import AdminApp from "@/server/firebase/admin.init";
import ClientApp from "@/server/firebase/client.init";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Service_Response, STATUS_CODES } from "@/server/response/response.module";
import { Credential, Verification, UpdateCredential } from "@/server/auth/auth.module";
import { Timestamp } from "firebase-admin/firestore";

const {
    UserCollection,
} = AdminApp;

export async function verifyClientToken(token: string): Promise<Service_Response<{ uid: string; email: string } | null>> {
    const userCredential: UserCredential = await signInWithCustomToken(ClientApp.clientAuth, token);
    signOut(ClientApp.clientAuth);
    if (!userCredential?.user?.email) throw new Error("Invalid Token");
    await UserCollection.doc(userCredential.user.email).update({
        last_online: Timestamp.now(),
    });
    return {
        code: STATUS_CODES.OK,
        message: `Token Verified for ${userCredential.user.email}`,
        data: {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
        },
    };
};

export async function generateClientToken(credential: Credential): Promise<Service_Response<Verification | null>> {
    const { email, password } = credential;
    const userCredential: UserCredential = await signInWithEmailAndPassword(
        ClientApp.clientAuth,
        email,
        password
    );
    const uid = userCredential.user.uid;
    const token = await AdminApp.adminAuth.createCustomToken(uid);
    signOut(ClientApp.clientAuth);
    return {
        code: STATUS_CODES.OK,
        message: `Token Generated for ${email}`,
        data: {
            token,
            user: {
                id: email,
            }
        },
    }
};

export async function invalidateClientToken(token: string): Promise<Service_Response<null>> {
    const userCredential: UserCredential = await signInWithCustomToken(ClientApp.clientAuth, token);
    await AdminApp.adminAuth.revokeRefreshTokens(userCredential.user.uid);
    signOut(ClientApp.clientAuth);
    return {
        code: STATUS_CODES.OK,
        message: `Token Invalidated for ${userCredential.user.email}`,
    };
};

export async function addCredentials(credential: Credential): Promise<Service_Response<Verification | null>> {
    const { email, password } = credential;

    const user = await AdminApp.UserCollection.doc(email).get();
    if (user.exists) {
        return {
            code: STATUS_CODES.BAD_REQUEST,
            message: "Email Already in Use",
        };
    }
    if (password.length < 8)
        return {
            code: STATUS_CODES.BAD_REQUEST,
            message: "Invalid Password",
        };
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
        ClientApp.clientAuth,
        email,
        password
    );
    const uid = userCredential.user.uid;
    const token = await AdminApp.adminAuth.createCustomToken(uid);
    signOut(ClientApp.clientAuth);
    return {
        code: STATUS_CODES.OK,
        message: `Credentials Added for ${email}`,
        data: {
            token: token,
            user: {
                id: email,
            }
        },
    };
};

export async function updateCredentials({ email, newPassword, currentPassword }: UpdateCredential): Promise<Service_Response<Verification | null>> {
    const userCredential: UserCredential = await signInWithEmailAndPassword(ClientApp.clientAuth, email, currentPassword);
    signOut(ClientApp.clientAuth);
    const uid = userCredential.user.uid;
    await updatePassword(userCredential.user, newPassword);
    const token = await AdminApp.adminAuth.createCustomToken(uid);
    return {
        code: STATUS_CODES.OK,
        message: `Credentials Updated for ${email}`,
        data: {
            token: token,
            user: {
                id: email,
            }
        },
    };
};