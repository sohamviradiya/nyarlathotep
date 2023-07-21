import { getProfileFromToken } from "@/server/user/user.service";
import {
    castToRequest,
    REQEST_STATUS,
    Request,
    Request_Input,
    REQUEST_TYPE,
} from "./request.module";
import { adminDb } from "@/server/firebase/admin.init";
import { Service_Response, STATUS_CODE } from "@/server/util/protocol.module";
import { User_Private } from "@/server/user/user.module";
import { FieldValue } from "firebase-admin/firestore";
import { eastablishContact } from "@/server/contact/contact.service";
import { Contact } from "../contact/contact.module";
import { getUserIDFromToken } from "../auth/auth.service";

const UserCollection = adminDb.collection("Users");
const RequestCollection = adminDb.collection("Requests");

export async function sendConnectionRequest(
    token: string,
    receiver_id: string,
    message: string
): Promise<Service_Response<null | Request>> {
    if (!message) message = "";
    const profile_service_response = await getProfileFromToken(token);
    if (!profile_service_response.data)
        return profile_service_response as Service_Response<null>;
    const user: User_Private = profile_service_response.data.user;
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
    }
}

export async function withdrawConnectionRequest(request_id: string): Promise<Service_Response<null>> {
    const requestRef = RequestCollection.doc(request_id);
    const request = castToRequest(await requestRef.get());
    if (!request) {
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: `No request found with id ${request_id}`,
        };
    };

    await UserCollection.doc(request.receiver as string).update({
        invitations: FieldValue.arrayRemove(requestRef),
    });
    await UserCollection.doc(request.sender as string).update({
        requests: FieldValue.arrayRemove(requestRef),
    });

    await requestRef.delete();

    return await {
        code: STATUS_CODE.OK,
        message: "Request Withdrawn",
    };
}

export async function getConnectionRequest(request_id: string): Promise<Service_Response<{
    request: Request
} | null>> {
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
        data: {
            request: castToRequest(request)
        }
    };
}

export async function acceptConnectionRequest(
    token: string,
    request_id: string
): Promise<Service_Response<null | {
    contact: Contact
}>> {
    const service_response = await getProfileFromToken(token);
    if (!service_response.data) 
        return service_response as Service_Response<null>;
    
    const user = service_response.data.user;
    const requestRef = RequestCollection.doc(request_id);
    const request = castToRequest(await requestRef.get());
    if (!request) {
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: `No request found with id ${request_id}`,
        };
    }
    if (request.receiver != user.id) {
        return {
            code: STATUS_CODE.FORBIDDEN,
            message: `Request ${request_id} is not for ${user.id}`,
        };
    }
    await requestRef.update({
        status: REQEST_STATUS.ACCEPTED,
        status_changed: FieldValue.serverTimestamp(),
    });
    const contact_service_response = await eastablishContact(request.id);
    if (!contact_service_response.data) {
        return contact_service_response as Service_Response<null>;
    }
    return {
        code: STATUS_CODE.OK,
        message: `Request ${request_id} accepted`,
        data: {
            contact: contact_service_response.data.contact
        }
    }
}

export async function rejectConnectionRequest(
    token: string,
    request_id: string
): Promise<Service_Response<null>> {
    const auth_service_response = await getUserIDFromToken(token);
    if (!auth_service_response.data)
        return auth_service_response as Service_Response<null>;
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
    if (data.receiver.id != auth_service_response.data.id) {
        return {
            code: STATUS_CODE.FORBIDDEN,
            message: `Request ${request_id} is not for ${auth_service_response.data.id}`,
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
}

export async function getInvitations(token: string): Promise<Service_Response<null | {
    invitations: Request[]
}>> {
    const profile_service_response = await getProfileFromToken(token);
    if (!profile_service_response.data) {
        return profile_service_response as Service_Response<null>;
    }
    const user = profile_service_response.data.user;
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
        data: {
            invitations: invitation_details.map((invitation) => castToRequest(invitation)),
        }
    }
}

export async function getRequests(token: string): Promise<Service_Response<null | {
    requests: Request[]
}>> {
    const profile_service_response = await getProfileFromToken(token);
    if (!profile_service_response.data) {
        return profile_service_response as Service_Response<null>;
    }
    const user = profile_service_response.data.user;
    const request_list = user.requests;
    const request_details = await Promise.all(
        request_list.map(async (request_id: string) => {
            return await RequestCollection.doc(request_id).get();
        })
    );
    return {
        code: STATUS_CODE.OK,
        message: `Requests found for ${user.email}`,
        data: {
            requests: request_details.map((request) => castToRequest(request)),
        }
    };
}
