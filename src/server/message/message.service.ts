import { castContact } from "@/server/contact/contact.module";
import { ContactCollection, MessageCollection } from "@/server/firebase/admin.init";
import { getProfileFromToken } from "@/server/user/user.service";
import { Service_Response, STATUS_CODE } from "@/server/util/protocol.module";
import { castMessage, Message, MESSAGE_DIRECTION, MESSAGE_STATUS } from "./message.module";
import { FieldValue } from "firebase-admin/firestore";
import { getUserIDFromToken } from "../auth/auth.service";

export async function getMessages(contact_id: string): Promise<Service_Response<null | { messages: Message[] }>> {
    try {
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
    } catch (error: any) {
        console.log(error);
        return {
            code: STATUS_CODE.INTERNAL_ERROR,
            message: "Internal Error",
            data: null,
        };
    }
}

export async function addMessage(
    contact_id: string,
    content: string,
    token: string
): Promise<Service_Response<null>> {
    if (!contact_id)
        return {
            code: STATUS_CODE.BAD_REQUEST,
            message: "Invalid request",
            data: null,
        };
    const auth_response = await getUserIDFromToken(token);
    if (!auth_response.data)
        return auth_response as Service_Response<null>;

    const contactRef = await ContactCollection.doc(contact_id);
    const contact = castContact(await contactRef.get());
    var direction = MESSAGE_DIRECTION.OUTGOING;
    if (contact.sender === auth_response.data.id) {
        direction = MESSAGE_DIRECTION.OUTGOING;
    } else if (contact.receiver === auth_response.data.id) {
        direction = MESSAGE_DIRECTION.INCOMING;
    } else {
        return {
            code: STATUS_CODE.UNAUTHORIZED,
            message: `You are not authorized to add messages to ${contact_id}`,
            data: null,
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
        data: null,
    };
}

export async function updateMessage(message_id: string, status: MESSAGE_STATUS): Promise<Service_Response<null|{message: Message}>> {
    try {
        if (!message_id || !status)
            return {
                code: STATUS_CODE.BAD_REQUEST,
                message: "Invalid request",
                data: null,
            };
        const messageRef = await MessageCollection.doc(message_id);
        await messageRef.update({
            status,
            status_changed: FieldValue.serverTimestamp(),
        });
        const message = castMessage(await messageRef.get());
        return {
            code: STATUS_CODE.OK,
            message: `Message ${message_id} updated`,
            data: {
                message,
            }
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
