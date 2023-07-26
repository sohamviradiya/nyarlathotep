import { MESSAGE_STATUS, MESSAGE_STATUS_TYPE } from "@/server/message/message.module";
import { STATUS_CODES, Service_Response } from "@/server/response/response.module";
import { Message } from "@/server/message/message.module";
import { Unauthorized } from "../response/response.util";
import { Contact } from "../contact/contact.module";
import { DocumentReference } from "firebase-admin/firestore";
export function castToMessage(message: FirebaseFirestore.DocumentSnapshot): Message {
    const data = message.data();
    const id = message.id;
    if (!data) throw new Error("Message not found");
    return {
        id,
        content: data.content,
        status: data.status,
        status_changed: new Date(data.status_changed._seconds * 1000),
        contact: data.contact.id,
        direction: data.direction,
    };
}

export async function getMessagesFromReference(messages: DocumentReference[]) {
    if(!messages?.length) return [];
    return await Promise.all(messages.map(async (messageRef: DocumentReference) => castToMessage(await messageRef.get())));
}

export async function checkStatus(message: Message, contact: Contact, user: string, new_status: MESSAGE_STATUS_TYPE): Promise<Service_Response<null | { status: MESSAGE_STATUS_TYPE }>> {
    const received_status_array = [MESSAGE_STATUS.READ, MESSAGE_STATUS.APPROVED, MESSAGE_STATUS.REJECTED];
    
    if (contact.sender != user && contact.receiver != user)
        return Unauthorized({ message: `You are not authorized to update message to ${new_status}` });
    
    if (message.status == MESSAGE_STATUS.DRAFT && new_status != MESSAGE_STATUS.SENT && contact.sender != user)
        return Unauthorized({ message: `You are not authorized to update message to ${new_status}` });
    
    if (message.status in received_status_array && !(new_status in received_status_array) && contact.receiver != user)
        return Unauthorized({ message: `You are not authorized to update message to ${new_status}` });
    
    if (message.status == MESSAGE_STATUS.SENT && new_status != MESSAGE_STATUS.READ && contact.receiver != user)
        return Unauthorized({ message: `You are not authorized to update message to ${new_status}` });

    return {
        code: STATUS_CODES.OK,
        message: `Message status changed to ${new_status}`,
        data: {
            status: message.status,
        }
    };
}