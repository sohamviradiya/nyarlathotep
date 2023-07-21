import {
	createUserWithEmailAndPassword,
	signInWithCustomToken,
	signOut,
	updatePassword,
	UserCredential,
} from "firebase/auth";
import { adminAuth } from "../firebase/admin.init";
import { clientAuth } from "../firebase/client.init";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Protocol, STATUS_CODE } from "../util/protocol.module";
import { Credential } from "./auth.module";
import { IncomingHttpHeaders } from "http2";

export function extractToken(headers: IncomingHttpHeaders): string | null {
	if (!(headers.authorization && headers.authorization.startsWith("Bearer "))) {
		return null;
	}
	return headers.authorization.split("Bearer ")[1];
};

export async function verifyClientToken(token: string): Promise<Protocol>{
	try {
		const userCredential: UserCredential = await signInWithCustomToken(clientAuth, token);
		signOut(clientAuth);
		if (userCredential?.user?.email)
			return {
				code: STATUS_CODE.OK,
				message: `Token Verified for ${userCredential.user.email}`,
				data: {
					uid: userCredential.user.uid,
					email: userCredential.user.email,
				},
			};
		else {
			return {
				code: STATUS_CODE.BAD_REQUEST,
				message: "Invalid Token",
			};
		}
	} catch (error: any) {
		return {
			code: STATUS_CODE.BAD_REQUEST,
			message: error.code,
		};
	}
};

export async function generateClientToken(credential: Credential): Promise<Protocol> {
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
	try {
		const userCredential: UserCredential = await signInWithEmailAndPassword(
			clientAuth,
			email,
			password
		);
		const uid = userCredential.user.uid;
		const token = await adminAuth.createCustomToken(uid);
		signOut(clientAuth);
		return {
			code: STATUS_CODE.OK,
			message: `Token Generated for ${email}`,
			data: {
				token: token,
			},
		};
	} catch (error: any) {
		return {
			code: STATUS_CODE.UNAUTHORIZED,
			message: error.code,
		};
	}
};

export async function invalidateClientToken(token: string): Promise<Protocol> {
	try {
		const userCredential: UserCredential = await signInWithCustomToken(clientAuth, token);
		await adminAuth.revokeRefreshTokens(userCredential.user.uid);
		signOut(clientAuth);
		return {
			code: STATUS_CODE.OK,
			message: `Token Invalidated for ${userCredential.user.email}`,
		};
	} catch (error: any) {
		return {
			code: STATUS_CODE.BAD_REQUEST,
			message: error.code,
		};
	}
};

export async function addCredentials(credential: Credential): Promise<Protocol> {
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
	try {
		const userCredential: UserCredential = await createUserWithEmailAndPassword(
			clientAuth,
			email,
			password
		);
		const uid = userCredential.user.uid;
		const token = await adminAuth.createCustomToken(uid);
		signOut(clientAuth);
		return {
			code: STATUS_CODE.OK,
			message: `Credentials Added for ${email}`,
			data: {
				token: token,
			},
		};
	} catch (error: any) {
		return {
			code: STATUS_CODE.UNAUTHORIZED,
			message: error.code,
		};
	}
};

export async function updateCredentials(
	email: string,
	currentPassword: string,
	newPassword: string
): Promise<Protocol>{
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
		};
	try {
		const userCredential: UserCredential = await signInWithEmailAndPassword(
			clientAuth,
			email,
			currentPassword
		);
		signOut(clientAuth);
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
	} catch (error: any) {
		return {
			code: STATUS_CODE.UNAUTHORIZED,
			message: error.code,
		};
	}
};
