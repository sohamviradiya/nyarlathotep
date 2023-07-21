import { castToContact } from "@/server/contact/contact.util";
import { ContactCollection, MessageCollection } from "@/server/firebase/admin.init";
import { Service_Response, STATUS_CODE } from "@/server/response/response.module";
import { Message, MESSAGE_DIRECTION, MESSAGE_STATUS, MESSAGE_STATUS_TYPE } from "@/server/message/message.module";
import { castMessage, checkStatus } from "@/server/message/message.util";
import { FieldValue } from "firebase-admin/firestore";
import { getUserIDFromToken } from "@/server/auth/auth.service";

export async function getMessages(contact_id: string): Promise<Service_Response<null | { messages: Message[] }>> {
    const contact = await ContactCollection.doc(contact_id).get();
    if (!contact.exists) throw new Error("Contact does not exist");
    const message_list = contact.data()?.messages;
    if (message_list.length === 0) throw new Error("No messages found");
    const messages_details_list = await Promise.all(
        message_list.map(async (message_ref: FirebaseFirestore.DocumentReference) => {
            return castMessage(await message_ref.get());
        })
    );
    return {
        code: STATUS_CODE.OK,
        message: `Messages fetched for ${contact_id}`,
        data: {
            messages: messages_details_list,
        }
    };
}

export async function addMessage(contact_id: string, content: string, token: string): Promise<Service_Response<null>> {
    const auth_response = await getUserIDFromToken(token);
    if (!auth_response.data)
        return auth_response as Service_Response<null>;
    const contactRef = await ContactCollection.doc(contact_id);
    const contact = castToContact(await contactRef.get());
    var direction = MESSAGE_DIRECTION.OUTGOING;
    if (contact.sender === auth_response.data.id) {
        direction = MESSAGE_DIRECTION.OUTGOING;
    } else if (contact.receiver === auth_response.data.id) {
        direction = MESSAGE_DIRECTION.INCOMING;
    } else {
        return {
            code: STATUS_CODE.UNAUTHORIZED,
            message: `You are not authorized to add messages to ${contact_id}`,
        };
    }
    const messageRef = await MessageCollection.add({
        content,
        direction,
        status: MESSAGE_STATUS.DRAFT,
        status_changed: FieldValue.serverTimestamp(),
    });
    await contactRef.update({
        messages: FieldValue.arrayUnion(messageRef),
    });
    return {
        code: STATUS_CODE.OK,
        message: `Message added to ${contact_id}`,

    };
}

export async function updateMessage(message_id: string, content: string): Promise<Service_Response<null>> {
    const messageRef = await MessageCollection.doc(message_id);
    const message = castMessage(await messageRef.get());
    if (message.status == MESSAGE_STATUS.READ || message.status == MESSAGE_STATUS.APPROVED || message.status == MESSAGE_STATUS.REJECTED) {
        return {
            code: STATUS_CODE.UNAUTHORIZED,
            message: `You are not authorized to update message ${message_id}`,
        };
    };
    await messageRef.update({
        content,
        status_changed: FieldValue.serverTimestamp(),
    });
    return {
        code: STATUS_CODE.OK,
        message: `Message ${message_id} updated`,
    };
}

export async function confirmMessage(message_id: string, status: MESSAGE_STATUS_TYPE): Promise<Service_Response<null | { status: MESSAGE_STATUS_TYPE }>> {
    const messageRef = await MessageCollection.doc(message_id);
    const current_status = castMessage(await messageRef.get()).status;
    const status_service_response = await checkStatus(current_status, status, message_id);
    if (!status_service_response.data)
        return status_service_response as Service_Response<null>;
    await messageRef.update({
        status,
        status_changed: FieldValue.serverTimestamp(),
    });
    return {
        code: STATUS_CODE.OK,
        message: `Message ${message_id} status changed to ${status}`,
        data: {
            status: current_status,
        }
    };
};

