import { MESSAGE_STATUS, MESSAGE_STATUS_TYPE } from "@/server/message/message.module";
import { STATUS_CODES, Service_Response } from "@/server/response/response.module";
import { Message } from "@/server/message/message.module";
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

export async function checkStatus(current_status: MESSAGE_STATUS_TYPE, status: MESSAGE_STATUS_TYPE, message_id: string): Promise<Service_Response<null | { status: MESSAGE_STATUS_TYPE }>> {
    if (current_status == MESSAGE_STATUS.READ || current_status == MESSAGE_STATUS.APPROVED || current_status == MESSAGE_STATUS.REJECTED)
        if (status != MESSAGE_STATUS.APPROVED && status != MESSAGE_STATUS.REJECTED)
            return {
                code: STATUS_CODES.UNAUTHORIZED,
                message: `You are not authorized to update message ${message_id} to ${status}`,
            };
    if (current_status == MESSAGE_STATUS.DRAFT && status != MESSAGE_STATUS.SENT)
        return {
            code: STATUS_CODES.UNAUTHORIZED,
            message: `You are not authorized to update message ${message_id} to ${status}`,
        };
    if (current_status == MESSAGE_STATUS.SENT && status != MESSAGE_STATUS.READ)

        return {
            code: STATUS_CODES.UNAUTHORIZED,
            message: `You are not authorized to update message ${message_id} to ${status}`,
        };

    return {
        code: STATUS_CODES.OK,
        message: `Message ${message_id} status changed to ${status}`,
        data: {
            status: current_status,
        }
    };
}