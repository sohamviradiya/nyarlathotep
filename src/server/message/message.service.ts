import { castToContact } from "@/server/contact/contact.util";
import {  ContactCollection,MessageCollection,} from "@/server/firebase/admin.init";
import { Service_Response, STATUS_CODES } from "@/server/response/response.module";
import { MESSAGE_DIRECTION, MESSAGE_STATUS, MESSAGE_STATUS_TYPE, Message } from "@/server/message/message.module";
import { castToMessage, checkStatus } from "@/server/message/message.util";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { verifyClientToken } from "../auth/auth.service";

export async function getMessage(message_id: string, token: string): Promise<Service_Response<null | { message: Message }>> {
    const auth_response = await verifyClientToken(token);
    if (!auth_response.data)
        return auth_response as Service_Response<null>;
    const messageRef = MessageCollection.doc(message_id);
    const messageDoc = await messageRef.get();
    const message = castToMessage(messageDoc);
    const contact = castToContact(await messageDoc.data()?.contact.get());
    if (contact.sender != auth_response.data.email && contact.receiver != auth_response.data.email) {
        return {
            code: STATUS_CODES.UNAUTHORIZED,
            message: "Unauthorized",
        };
    }
    return {
        code: STATUS_CODES.OK,
        message: "Message retrieved",
        data: {
            message
        }
    };
};

export async function addMessage(contact_id: string, content: string, token: string): Promise<Service_Response<null | { message: Message }>> {
    const auth_response = await verifyClientToken(token);
    if (!auth_response.data)
        return auth_response as Service_Response<null>;
    const contactRef = ContactCollection.doc(contact_id);
    const contact = castToContact(await contactRef.get());

    if (contact.sender === auth_response.data.email) {
        const messageRef = await MessageCollection.add({
            content,
            contact: contactRef,
            status: MESSAGE_STATUS.DRAFT,
            status_changed: Timestamp.now(),
            direction: MESSAGE_DIRECTION.OUTGOING,
        });
        await contactRef.update({
            "messages.outgoing": FieldValue.arrayUnion(messageRef)
        });

        return {
            code: STATUS_CODES.OK,
            message: `Message added to ${contact_id}`,
            data: {
                message: castToMessage(await messageRef.get())
            }
        };
    }
    else if (contact.receiver === auth_response.data.email) {
        const messageRef = await MessageCollection.add({
            content,
            contact: contactRef,
            status: MESSAGE_STATUS.DRAFT,
            status_changed: Timestamp.now(),
            direction: MESSAGE_DIRECTION.INCOMING,
        });

        await contactRef.update({
            "messages.incoming": FieldValue.arrayUnion(messageRef)
        });
        return {
            code: STATUS_CODES.OK,
            message: `Message added to ${contact_id}`,
            data: {
                message: castToMessage(await messageRef.get())
            }
        };
    }
    else {
        return {
            code: STATUS_CODES.UNAUTHORIZED,
            message: `You are not authorized to add messages to ${contact_id}`,
        };
    }
}

export async function updateMessage(message_id: string, content: string, token: string): Promise<Service_Response<null | {
    message: Message
}>> {
    const messageRef = await MessageCollection.doc(message_id);
    const message = castToMessage(await messageRef.get());

    const contactRef = (await messageRef.get()).data()?.contact as FirebaseFirestore.DocumentReference;
    const contact = castToContact(await contactRef.get());
    const auth_response = await verifyClientToken(token);
    if (!auth_response.data)
        return auth_response as Service_Response<null>;
    if (contact.sender !== auth_response.data.email) {
        return {
            code: STATUS_CODES.UNAUTHORIZED,
            message: `You are not authorized to update messages to ${contactRef}`,
        };
    }

    if (message.status == MESSAGE_STATUS.READ || message.status == MESSAGE_STATUS.APPROVED || message.status == MESSAGE_STATUS.REJECTED) {
        return {
            code: STATUS_CODES.FORBIDDEN,
            message: `Message ${message_id} is in ${message.status} state, cannot update`,
        };
    };
    await messageRef.update({
        content,
        status_changed: Timestamp.now(),
    });
    return {
        code: STATUS_CODES.OK,
        message: `Message ${message_id} updated`,
        data: {
            message: castToMessage(await messageRef.get())
        }
    };
}

export async function confirmMessage(message_id: string, status: MESSAGE_STATUS_TYPE, token: string): Promise<Service_Response<null | { message: Message }>> {

    const messageRef = await MessageCollection.doc(message_id);
    const message = castToMessage(await messageRef.get());

    const contactRef = (await messageRef.get()).data()?.contact as FirebaseFirestore.DocumentReference;
    const contact = castToContact(await contactRef.get());
    const auth_response = await verifyClientToken(token);
    if (!auth_response.data)
        return auth_response as Service_Response<null>;
    const status_service_response = await checkStatus(message, contact, auth_response.data.email, status);

    if (!status_service_response.data)
        return status_service_response as Service_Response<null>;
    await messageRef.update({
        status,
        status_changed: Timestamp.now(),
    });

    return {
        code: STATUS_CODES.OK,
        message: `Message ${message_id} status changed to ${status}`,
        data: {
            message: castToMessage(await messageRef.get())
        }
    };
}

export async function deleteMessage(message_id: string, token: string): Promise<Service_Response<null>> {
    const messageRef = await MessageCollection.doc(message_id);
    const message = castToMessage(await messageRef.get());

    const contactRef = (await messageRef.get()).data()?.contact as FirebaseFirestore.DocumentReference;
    const contact = castToContact(await contactRef.get());
    const auth_response = await verifyClientToken(token);
    if (!auth_response.data)
        return auth_response as Service_Response<null>;
    if (contact.sender !== auth_response.data.email) {
        return {
            code: STATUS_CODES.UNAUTHORIZED,
            message: `You are not authorized to update messages to ${contactRef}`,
        };
    }

    if (message.status == MESSAGE_STATUS.READ || message.status == MESSAGE_STATUS.APPROVED || message.status == MESSAGE_STATUS.REJECTED) {
        return {
            code: STATUS_CODES.FORBIDDEN,
            message: `Message ${message_id} is in ${message.status} state, cannot delete`,
        };
    };

    await contactRef.update({
        messages: {
            [message.direction.toLowerCase()]: {
                [message.status.toLowerCase()]: FieldValue.arrayRemove(messageRef),
            }
        }
    });

    await messageRef.delete();
    return {
        code: STATUS_CODES.OK,
        message: `Message ${message_id} deleted`,
    };
}


