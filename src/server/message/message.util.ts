import { MESSAGE_STATUS, MESSAGE_STATUS_TYPE } from "@/server/message/message.module";
import { STATUS_CODE, Service_Response } from "@/server/response/response.module";
import { Message } from "@/server/message/message.module";
export function castMessage(message: FirebaseFirestore.DocumentSnapshot): Message {
    const id = message.id;
    const data = message.data()?.content;
    return {
        id,
        content: data.content,
        direction: data.direction,
        status: data.status,
        status_changed: data.status_changed.toDate(),
    };
}

export async function checkStatus(current_status: MESSAGE_STATUS_TYPE, status: MESSAGE_STATUS_TYPE, message_id: string): Promise<Service_Response<null | { status: MESSAGE_STATUS_TYPE }>> {
    if (current_status == MESSAGE_STATUS.READ || current_status == MESSAGE_STATUS.APPROVED || current_status == MESSAGE_STATUS.REJECTED)
        if (status != MESSAGE_STATUS.APPROVED && status != MESSAGE_STATUS.REJECTED)
            return {
                code: STATUS_CODE.UNAUTHORIZED,
                message: `You are not authorized to update message ${message_id} to ${status}`,
            };
    if (current_status == MESSAGE_STATUS.DRAFT && status != MESSAGE_STATUS.SENT)
        return {
            code: STATUS_CODE.UNAUTHORIZED,
            message: `You are not authorized to update message ${message_id} to ${status}`,
        };
    if (current_status == MESSAGE_STATUS.SENT && status != MESSAGE_STATUS.READ)

        return {
            code: STATUS_CODE.UNAUTHORIZED,
            message: `You are not authorized to update message ${message_id} to ${status}`,
        };

    return {
        code: STATUS_CODE.OK,
        message: `Message ${message_id} status changed to ${status}`,
        data: {
            status: current_status,
        }
    };
}