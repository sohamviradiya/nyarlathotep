import { getProfileFromToken } from "@/server/user/user.service";
import {
    REQUEST_STATUS,
    Request,
    Request_Input,
} from "@/server/request/request.module";
import { castToRequest } from "@/server/request/request.util";
import { CommunityCollection, adminDb } from "@/server/firebase/admin.init";
import { Service_Response, STATUS_CODE } from "@/server/response/response.module";
import { FieldValue } from "firebase-admin/firestore";
import { establishContact } from "@/server/contact/contact.service";
import { checkModerationAccessWithToken, getMemberRole } from "@/server/community/community.service";
import { castToCommunityPrivate } from "@/server/community/community.util";

const UserCollection = adminDb.collection("Users");
const RequestCollection = adminDb.collection("Requests");

export async function sendRequest(
    request: Request_Input
): Promise<Service_Response<null | Request>> {
    const senderRef = await UserCollection.doc(request.sender as string);

    if (request.type == "CONNECT") {
        const receiverRef = await UserCollection.doc(request.receiver as string);
        const requestRef = await RequestCollection.add({
            sender: senderRef,
            type: request.type,
            status: REQUEST_STATUS.PENDING,
            message: request.message,
            status_changed: FieldValue.serverTimestamp(),
            receiver: receiverRef,
        });
        senderRef.update({
            requests: FieldValue.arrayUnion(requestRef)
        });
        receiverRef.update({
            invitations: FieldValue.arrayUnion(requestRef)
        });
        return {
            code: STATUS_CODE.OK,
            message: `Request to connect to ${receiverRef.id} sent`,
            data: castToRequest(await requestRef.get()),
        };
    }
    else {
        const receiverRef = await CommunityCollection.doc(request.receiver as string);
        if (request.type == "MODERATE" || request.type == "ANNOUNCE") {
            const community = castToCommunityPrivate(await receiverRef.get());
            const role_service_response = await getMemberRole(community, senderRef.id);
            if (!role_service_response.data) return role_service_response as Service_Response<null>;
        };
        const requestRef = await RequestCollection.add({
            sender: senderRef,
            type: request.type,
            status: REQUEST_STATUS.PENDING,
            message: request.message,
            status_changed: FieldValue.serverTimestamp(),
            receiver: receiverRef,
        });
        senderRef.update({
            requests: FieldValue.arrayUnion(requestRef)
        });
        receiverRef.update({
            requests: FieldValue.arrayUnion(requestRef)
        });
        return {
            code: STATUS_CODE.OK,
            message: `Request to ${request.type} in ${receiverRef.id} community sent`,
            data: castToRequest(await requestRef.get()),
        };
    }
}

export async function withdrawRequest(request_id: string): Promise<Service_Response<null>> {
    const requestRef = RequestCollection.doc(request_id);
    const request = castToRequest(await requestRef.get());
    if (!request) {
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: `No request found with id ${request_id}`,
        };
    }
    if (request.status != REQUEST_STATUS.PENDING) {
        return {
            code: STATUS_CODE.FORBIDDEN,
            message: `Request ${request_id} cannot be withdrawn`,
        };
    }
    const senderRef = await UserCollection.doc(request.sender as string);
    senderRef.update({
        requests: FieldValue.arrayRemove(requestRef)
    });
    if (request.type == "CONNECT") {
        const receiverRef = await UserCollection.doc(request.receiver as string);
        receiverRef.update({
            invitations: FieldValue.arrayRemove(requestRef)
        });
    }
    else {
        const receiverRef = await CommunityCollection.doc(request.receiver as string);
        receiverRef.update({
            requests: FieldValue.arrayRemove(requestRef)
        });
    }
    await requestRef.delete();
    return {
        code: STATUS_CODE.OK,
        message: `Request ${request_id} withdrawn`,
    };
};

export async function confirmConnectionRequest(request_id: string, decision: REQUEST_STATUS.ACCEPTED | REQUEST_STATUS.REJECTED, token: string): Promise<Service_Response<null>> {
    const service_response = await getProfileFromToken(token);
    if (!service_response.data)
        return service_response as Service_Response<null>;
    const requestRef = RequestCollection.doc(request_id);
    const request = castToRequest(await requestRef.get());
    if (decision == REQUEST_STATUS.ACCEPTED) {
        await requestRef.update({
            status: REQUEST_STATUS.ACCEPTED,
            status_changed: FieldValue.serverTimestamp(),
            message: "Your request to connect with " + request.receiver + " has been accepted",
        });
        const contact_service_response = await establishContact(request.id);
        if (!contact_service_response.data) {
            return contact_service_response as Service_Response<null>;
        }
        return {
            code: STATUS_CODE.OK,
            message: `Request ${request_id} accepted`,
        }
    }
    else {
        await requestRef.update({
            status: REQUEST_STATUS.REJECTED,
            status_changed: FieldValue.serverTimestamp(),
            message: "Your request to connect with " + request.receiver + " has been rejected",
        });
        return {
            code: STATUS_CODE.OK,
            message: `Request ${request_id} rejected`,
        }
    }
}

export async function confirmJoinRequest(request_id: string, decision: REQUEST_STATUS.ACCEPTED | REQUEST_STATUS.REJECTED, token: string): Promise<Service_Response<null>> {
    const requestRef = RequestCollection.doc(request_id);
    const request = castToRequest(await requestRef.get());
    if (!request) {
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: `No request found with id ${request_id}`,
        };
    }
    const communityRef = CommunityCollection.doc(request.receiver as string);
    const community = castToCommunityPrivate(await communityRef.get());

    const auth_service_response = await checkModerationAccessWithToken(community, token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;

    if (decision == REQUEST_STATUS.ACCEPTED) {
        await requestRef.update({
            status: REQUEST_STATUS.ACCEPTED,
            status_changed: FieldValue.serverTimestamp(),
            message: "Your request to join " + community.name + " has been accepted",
        });
        return {
            code: STATUS_CODE.OK,
            message: `Request ${request_id} accepted`,
        }
    }
    else {
        await requestRef.update({
            status: REQUEST_STATUS.REJECTED,
            status_changed: FieldValue.serverTimestamp(),
            message: "Your request to join " + community.name + " has been rejected",
        });
        return {
            code: STATUS_CODE.OK,
            message: `Request ${request_id} rejected`,
        }
    }
}

export async function confirmModerateRequest(request_id: string, decision: REQUEST_STATUS.ACCEPTED | REQUEST_STATUS.REJECTED, token: string): Promise<Service_Response<null>> {
    const requestRef = RequestCollection.doc(request_id);
    const request = castToRequest(await requestRef.get());
    if (!request) {
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: `No request found with id ${request_id}`,
        };
    }
    const communityRef = CommunityCollection.doc(request.receiver as string);
    const community = castToCommunityPrivate(await communityRef.get());

    const auth_service_response = await checkModerationAccessWithToken(community, token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;

    const senderRef = await UserCollection.doc(request.sender as string);
    if (decision == REQUEST_STATUS.ACCEPTED) {
        await requestRef.update({
            status: REQUEST_STATUS.ACCEPTED,
            status_changed: FieldValue.serverTimestamp(),
            message: "Your request to moderate " + community.name + " has been accepted",
        });
        await communityRef.update({
            members: FieldValue.arrayRemove({
                user: senderRef,
                role: "MEMBER",
            })
        });
        await communityRef.update({
            members: FieldValue.arrayUnion({
                user: senderRef,
                role: "MODERATOR",
            })
        });

        return {
            code: STATUS_CODE.OK,
            message: `Request ${request_id} accepted`,
        }
    }
    else {
        await requestRef.update({
            status: REQUEST_STATUS.REJECTED,
            status_changed: FieldValue.serverTimestamp(),
            message: "Your request to moderate " + community.name + " has been rejected",
        });
        return {
            code: STATUS_CODE.OK,
            message: `Request ${request_id} rejected`,
        }
    }
};

export async function confirmAnnouncementRequest(request_id: string, decision: REQUEST_STATUS.ACCEPTED | REQUEST_STATUS.REJECTED, token: string) {

    const requestRef = RequestCollection.doc(request_id);
    const request = castToRequest(await requestRef.get());
    if (!request) {
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: `No request found with id ${request_id}`,
        };
    }
    const communityRef = CommunityCollection.doc(request.receiver as string);
    const community = castToCommunityPrivate(await communityRef.get());

    const auth_service_response = await checkModerationAccessWithToken(community, token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;

    const senderRef = await UserCollection.doc(request.sender as string);
    if (decision == REQUEST_STATUS.ACCEPTED) {
        await requestRef.update({
            status: REQUEST_STATUS.ACCEPTED,
            status_changed: FieldValue.serverTimestamp(),
            message: "Your request to announce in " + community.name + " has been accepted",
        });

        await communityRef.update({
            announcements: FieldValue.arrayUnion({
                content: request.message,
                user: senderRef,
                time: FieldValue.serverTimestamp(),
            })
        });

        return {
            code: STATUS_CODE.OK,
            message: `Request ${request_id} accepted`,
        }
    }
    else {
        await requestRef.update({
            status: REQUEST_STATUS.REJECTED,
            status_changed: FieldValue.serverTimestamp(),
            message: "Your request to announce in " + community.name + " has been rejected",
        });
        return {
            code: STATUS_CODE.OK,
            message: `Request ${request_id} rejected`,
        }
    }
}
