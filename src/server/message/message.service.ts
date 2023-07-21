import { castContact } from "../contact/contact.module";
import { adminDb } from "../firebase/admin.init";
import { getProfile } from "../user/user.service";
import { Protocol, STATUS_CODE } from "../util/protocol.module";
import { castMessage, MESSAGE_DIRECTION, MESSAGE_STATUS } from "./message.module";
import { FieldValue } from "firebase-admin/firestore";

const ContactCollection = adminDb.collection("Contacts");
const MessageCollection = adminDb.collection("Messages");

export async function getMessages(contact_id: string): Promise<Protocol> {
	try {
		const contact = await ContactCollection.doc(contact_id).get();

		if (!contact.exists) throw new Error("Contact does not exist");
		const message_list = contact.data()?.messages;
		if (message_list.length === 0) throw new Error("No messages found");
		const message_details = await Promise.all(
			message_list.map(async (message_ref: FirebaseFirestore.DocumentReference) => {
				return castMessage(await message_ref.get());
			})
		);
		return {
			code: STATUS_CODE.OK,
			message: `Messages fetched for ${contact_id}`,
			data: message_details,
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
): Promise<Protocol> {
	try {
		if (!contact_id)
			return {
				code: STATUS_CODE.BAD_REQUEST,
				message: "Invalid request",
				data: null,
			};
		const profile_service_response = await getProfile(token);
		if (profile_service_response.code !== STATUS_CODE.OK) throw new Error("Invalid token");
		const contactRef = await ContactCollection.doc(contact_id);
		const contact = castContact(await contactRef.get());
		var direction = MESSAGE_DIRECTION.OUTGOING;
		if (contact.sender === profile_service_response.data.id) {
			direction = MESSAGE_DIRECTION.OUTGOING;
		} else if (contact.receiver === profile_service_response.data.id) {
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
	} catch (error: any) {
		console.log(error);
		return {
			code: STATUS_CODE.INTERNAL_ERROR,
			message: "Internal Error",
			data: null,
		};
	}
}

export async function updateMessage(message_id: string, status: MESSAGE_STATUS): Promise<Protocol> {
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
			data: message,
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
