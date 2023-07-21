import {
    createUserWithEmailAndPassword,
    signInWithCustomToken,
    signOut,
    updatePassword,
    UserCredential,
} from "firebase/auth";
import { adminAuth, UserCollection } from "@/server/firebase/admin.init";
import ClientApp from "@/server/firebase/client.init";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Service_Response, STATUS_CODE } from "@/server/response/response.module";
import { Credential } from "@/server/auth/auth.module";
import { IncomingHttpHeaders } from "http2";

function extractToken(headers: IncomingHttpHeaders): string | null {
    if (!(headers.authorization && headers.authorization.startsWith("Bearer "))) {
        return null;
    }
    return headers.authorization.split("Bearer ")[1];
};

async function verifyClientToken(token: string): Promise<Service_Response<{ uid: string; email: string } | null>> {
    const userCredential: UserCredential = await signInWithCustomToken(ClientApp.clientAuth, token);
    signOut(ClientApp.clientAuth);
    if (userCredential?.user?.email) {
        return {
            code: STATUS_CODE.OK,
            message: `Token Verified for ${userCredential.user.email}`,
            data: {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
            },
        };
    }
    else {
        return {
            code: STATUS_CODE.BAD_REQUEST,
            message: "Invalid Token",
        };
    }
};

export const getUserIDFromToken = async (token: string): Promise<Service_Response<{ id: string, uid: string } | null>> => {
    const token_verification_response = await verifyClientToken(token);
    if (!token_verification_response.data) return token_verification_response as Service_Response<null>;
    const email = token_verification_response.data.email;
    const user = await UserCollection.where("email", "==", email).select("id").get();
    if (user.empty) {
        return {
            code: STATUS_CODE.BAD_REQUEST,
            message: "User does not exist",
        };
    }
    return {
        code: STATUS_CODE.OK,
        message: "User ID fetched",
        data: {
            id: user.docs[0].id,
            uid: token_verification_response.data.uid,
        },
    };
};

export async function generateClientToken(credential: Credential): Promise<Service_Response<{ token: string } | null>> {
    const { email, password } = credential;
    if (!email)
        return {
            code: STATUS_CODE.BAD_REQUEST,
            message: "Unable to fetch Email",
        }
    if (!password)
        return {
            code: STATUS_CODE.BAD_REQUEST,
            message: "Unable to fetch Password",
        };
    const userCredential: UserCredential = await signInWithEmailAndPassword(
        ClientApp.clientAuth,
        email,
        password
    );
    const uid = userCredential.user.uid;
    const token = await adminAuth.createCustomToken(uid);
    signOut(ClientApp.clientAuth);
    return {
        code: STATUS_CODE.OK,
        message: `Token Generated for ${email}`,
        data: {
            token: token,
        },
    }
};

export async function invalidateClientToken(token: string): Promise<Service_Response<null>> {
    const userCredential: UserCredential = await signInWithCustomToken(ClientApp.clientAuth, token);
    await adminAuth.revokeRefreshTokens(userCredential.user.uid);
    signOut(ClientApp.clientAuth);
    return {
        code: STATUS_CODE.OK,
        message: `Token Invalidated for ${userCredential.user.email}`,
    };
};

export async function addCredentials(credential: Credential): Promise<Service_Response<{ token: string } | null>> {
    const { email, password } = credential;
    if (!email)
        return {
            code: STATUS_CODE.BAD_REQUEST,
            message: "Unable to fetch Email",
        };

    if (!password)
        return {
            code: STATUS_CODE.BAD_REQUEST,
            message: "Unable to fetch Password",
        };
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
        ClientApp.clientAuth,
        email,
        password
    );
    const uid = userCredential.user.uid;
    const token = await adminAuth.createCustomToken(uid);
    signOut(ClientApp.clientAuth);
    return {
        code: STATUS_CODE.OK,
        message: `Credentials Added for ${email}`,
        data: {
            token: token,
        },
    };
};

export async function updateCredentials(
    email: string,
    currentPassword: string,
    newPassword: string
): Promise<Service_Response<{ token: string } | null>> {
    if (!email)
        return {
            code: STATUS_CODE.BAD_REQUEST,
            message: "Unable to fetch Email",
        };
    if (!currentPassword)
        return {
            code: STATUS_CODE.BAD_REQUEST,
            message: "Unable to fetch Current Password",
        };
    if (!newPassword)
        return {
            code: STATUS_CODE.BAD_REQUEST,
            message: "Unable to fetch New Password",
        }; const userCredential: UserCredential = await signInWithEmailAndPassword(
            ClientApp.clientAuth,
            email,
            currentPassword
        );
    signOut(ClientApp.clientAuth);
    const uid = userCredential.user.uid;
    await updatePassword(userCredential.user, newPassword);
    const token = await adminAuth.createCustomToken(uid);
    return {
        code: STATUS_CODE.OK,
        message: `Credentials Updated for ${email}`,
        data: {
            token: token,
        },
    };
};

