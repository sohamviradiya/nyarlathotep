import { getProfile } from "../user/user.service";
import {
	castToRequest,
	REQEST_STATUS,
	Request,
	Request_Input,
	REQUEST_TYPE,
} from "./request.module";
import { adminDb } from "../firebase/admin.init";
import { Protocol, STATUS_CODE } from "../util/protocol.module";
import { User_Private } from "../user/user.module";
import { FieldValue } from "firebase-admin/firestore";
import { eastablishContact } from "../contact/contact.service";

const UserCollection = adminDb.collection("Users");
const RequestCollection = adminDb.collection("Requests");

export async function sendConnectionRequest(
	token: string,
	receiver_id: string,
	message: string
): Promise<Protocol> {
	if (!message) message = "";
	try {
		const service_response = await getProfile(token);
		if (service_response.code != STATUS_CODE.OK) {
			return service_response;
		}
		const user: User_Private = service_response.data;
		const request_input: Request_Input = {
			type: REQUEST_TYPE.CONNECT,
			status: REQEST_STATUS.PENDING,
			status_changed: new Date(),
			message: message,
		};
		const senderRef = UserCollection.doc(user.id);
		const receiverRef = UserCollection.doc(receiver_id);
		console.log(request_input);
		const requestRef = await RequestCollection.add({
			...request_input,
			sender: senderRef,
			receiver: receiverRef,
			status_changed: FieldValue.serverTimestamp(),
		});
		await UserCollection.doc(receiver_id).update({
			invitations: FieldValue.arrayUnion(requestRef),
		});
		await UserCollection.doc(user.id).update({
			requests: FieldValue.arrayUnion(requestRef),
		});
		const request = await requestRef.get();
		return {
			code: STATUS_CODE.OK,
			message: `Request Sent to ${receiver_id} from ${user.id}`,
			data: castToRequest(request),
		};
	} catch (error: any) {
		console.log(error);
		return {
			code: STATUS_CODE.INTERNAL_ERROR,
			message: "Internal Error",
			data: null,
		};
	}
}

export async function withdrawConnectionRequest(
	token: string,
	receiver_id: string
): Promise<Protocol> {
	try {
		const service_response = await getProfile(token);
		if (service_response.code != STATUS_CODE.OK) {
			return service_response;
		}
		const user: User_Private = service_response.data;
		const senderRef = UserCollection.doc(user.id);
		const receiverRef = UserCollection.doc(receiver_id);
		const requestRef = await RequestCollection.where("sender", "==", senderRef)
			.where("receiver", "==", receiverRef)
			.limit(1)
			.get();
		if (requestRef.empty) {
			return {
				code: STATUS_CODE.NOT_FOUND,
				message: `No request found from ${user.id} to ${receiver_id}`,
			};
		}

		await UserCollection.doc(receiver_id).update({
			invitations: FieldValue.arrayRemove(requestRef.docs[0].ref),
		});
		await UserCollection.doc(user.id).update({
			requests: FieldValue.arrayRemove(requestRef.docs[0].ref),
		});

		await requestRef.docs[0].ref.delete();

		return await {
			code: STATUS_CODE.OK,
			message: "Request Withdrawn",
		};
	} catch (error: any) {
		console.log(error);
		return {
			code: STATUS_CODE.INTERNAL_ERROR,
			message: "Internal Error",
		};
	}
}

export async function getConnectionRequest(request_id: string) {
	try {
		const requestRef = RequestCollection.doc(request_id);
		const request = await requestRef.get();
		if (!request.exists) {
			return {
				code: STATUS_CODE.NOT_FOUND,
				message: `No request found with id ${request_id}`,
			};
		}
		return {
			code: STATUS_CODE.OK,
			message: `Request ${request_id} found`,
			data: castToRequest(request),
		};
	} catch (error: any) {
		console.log(error);
		return {
			code: STATUS_CODE.INTERNAL_ERROR,
			message: "Internal Error",
		};
	}
}

export async function acceptConnectionRequest(
	token: string,
	request_id: string
): Promise<Protocol> {
	try {
		const service_response = await getProfile(token);
		if (service_response.code != STATUS_CODE.OK) {
			return service_response;
		}
		const user: User_Private = service_response.data;
		const requestRef = RequestCollection.doc(request_id);
		const request = await requestRef.get();
		if (!request.exists) {
			return {
				code: STATUS_CODE.NOT_FOUND,
				message: `No request found with id ${request_id}`,
			};
		}
		const data = request.data();
		if (!data) throw new Error("Request data is null");
		if (data.receiver.id != user.id) {
			return {
				code: STATUS_CODE.FORBIDDEN,
				message: `Request ${request_id} is not for ${user.id}`,
			};
		}
		await requestRef.update({
			status: REQEST_STATUS.ACCEPTED,
			status_changed: FieldValue.serverTimestamp(),
		});
		return await eastablishContact(request_id);
	} catch (error: any) {
		console.log(error);
		return {
			code: STATUS_CODE.INTERNAL_ERROR,
			message: "Internal Error",
		};
	}
}

export async function rejectConnectionRequest(
	token: string,
	request_id: string
): Promise<Protocol> {
	try {
		const service_response = await getProfile(token);
		if (service_response.code != STATUS_CODE.OK) {
			return service_response;
		}
		const user: User_Private = service_response.data;
		const requestRef = RequestCollection.doc(request_id);
		const request = await requestRef.get();
		if (!request.exists) {
			return {
				code: STATUS_CODE.NOT_FOUND,
				message: `No request found with id ${request_id}`,
			};
		}
		const data = request.data();
		if (!data) throw new Error("Request data is null");
		if (data.receiver.id != user.id) {
			return {
				code: STATUS_CODE.FORBIDDEN,
				message: `Request ${request_id} is not for ${user.id}`,
			};
		}
		await requestRef.update({
			status: REQEST_STATUS.REJECTED,
			status_changed: FieldValue.serverTimestamp(),
		});
		return {
			code: STATUS_CODE.OK,
			message: `Request ${request_id} rejected`,
		};
	} catch (error: any) {
		console.log(error);
		return {
			code: STATUS_CODE.INTERNAL_ERROR,
			message: "Internal Error",
		};
	}
}

export async function getInvitations(token: string): Promise<Protocol> {
	try {
		const service_response = await getProfile(token);
		if (service_response.code != STATUS_CODE.OK) {
			return service_response;
		}
		const user = service_response.data;
		const invitation_list = user.invitations;
		if (invitation_list.length == 0)
			return {
				code: STATUS_CODE.NOT_FOUND,
				message: `User ${user.email} has no pending invitations`,
				data: null,
			};
		const invitation_details: FirebaseFirestore.DocumentSnapshot[] = await Promise.all(
			invitation_list.map(
				async (invitation_id: string): Promise<FirebaseFirestore.DocumentSnapshot> => {
					return await RequestCollection.doc(invitation_id).get();
				}
			)
		);
		return {
			code: STATUS_CODE.OK,
			message: `Invitations found for ${user.email}`,
			data: invitation_details.map((invitation) => castToRequest(invitation)),
		};
	} catch (error) {
		console.log(error);
		return {
			code: STATUS_CODE.INTERNAL_ERROR,
			message: "Unable to get user invitations",
			data: null,
		};
	}
}
export async function getRequests(token: string): Promise<Protocol> {
	try {
		const service_response = await getProfile(token);
		if (service_response.code != STATUS_CODE.OK) {
			return service_response;
		}
		const user = service_response.data;
		console.log(user);
		const request_list = user.requests;
		const request_details = await Promise.all(
			request_list.map(async (request_id: string) => {
				return await RequestCollection.doc(request_id).get();
			})
		);
		return {
			code: STATUS_CODE.OK,
			message: `Requests found for ${user.email}`,
			data: request_details.map((request) => castToRequest(request)),
		};
	} catch (error) {
		console.log(error);
		return {
			code: STATUS_CODE.INTERNAL_ERROR,
			message: "Unable to get requests",
			data: null,
		};
	}
}
