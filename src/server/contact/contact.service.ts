import { adminDb } from "../firebase/admin.init";
import { FieldValue } from "firebase-admin/firestore";
import { Protocol, STATUS_CODE } from "../util/protocol.module";
import { castContact } from "./contact.module";
import { getProfile } from "../user/user.service";

const UserCollection = adminDb.collection("Users");
const RequestCollection = adminDb.collection("Requests");
const ContactCollection = adminDb.collection("Contacts");

export async function eastablishContact(request_id: string): Promise<Protocol> {
	try {
		const request = await RequestCollection.doc(request_id).get();
		if (!request.exists) throw new Error("Request does not exist");
		const request_details = request.data();
		if (!request_details) throw new Error("Request does not exist");
		const contactref = await ContactCollection.add({
			sender: request_details.sender,
			receiver: request_details.receiver,
			messages: [],
			eastablished: new Date(),
		});
		await UserCollection.doc(request_details.sender.id).update({
			contacts: FieldValue.arrayUnion(contactref),
		});
		await UserCollection.doc(request_details.receiver.id).update({
			contacts: FieldValue.arrayUnion(contactref),
		});
		const contact = await contactref.get();
		await RequestCollection.doc(request_id).delete();
		return {
			code: STATUS_CODE.OK,
			message: "Contact Eastablished",
			data: castContact(contact),
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

export async function deleteContact(contact_id: string, token: string): Promise<Protocol> {
	try {
		const contact = await ContactCollection.doc(contact_id).get();
		if (!contact.exists) throw new Error("Contact does not exist");
		const contact_details = contact.data();
		if (!contact_details) throw new Error("Contact does not exist");
		if (contact_details.sender.id != token && contact_details.receiver.id != token)
			throw new Error("User does not have access to this contact");
		await UserCollection.doc(contact_details.sender.id).update({
			contacts: FieldValue.arrayRemove(contact.ref),
		});
		await UserCollection.doc(contact_details.receiver.id).update({
			contacts: FieldValue.arrayRemove(contact.ref),
		});
		await ContactCollection.doc(contact_id).delete();
		return {
			code: STATUS_CODE.OK,
			message: "Contact Deleted",
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

export async function getContact(contact_id: string, token: string): Promise<Protocol> {
	try {
		const contact = await ContactCollection.doc(contact_id).get();
		if (!contact.exists) throw new Error("Contact does not exist");
		const contact_details = contact.data();
		if (!contact_details) throw new Error("Contact does not exist");
		if (contact_details.sender.id != token && contact_details.receiver.id != token)
			throw new Error("User does not have access to this contact");
		return {
			code: STATUS_CODE.OK,
			message: "Contact Retrieved",
			data: castContact(contact),
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

export async function getContacts(token: string): Promise<Protocol> {
	try {
		const profile_service_response = await getProfile(token);
		if (profile_service_response.code != STATUS_CODE.OK) return profile_service_response;
		const contact_list = profile_service_response.data.contacts;
		if (contact_list.length == 0)
			return {
				code: STATUS_CODE.NOT_FOUND,
				message: `No Contacts for ${profile_service_response.data.name}`,
				data: [],
			};
		const contact_details = await Promise.all(
			contact_list.map(async (contact_id: string) => {
				const contact_data = await ContactCollection.doc(contact_id).get();
				return castContact(contact_data);
			})
		);
		return {
			code: STATUS_CODE.OK,
			message: "Contacts Retrieved",
			data: contact_details,
		};
	} catch (error: any) {
		console.log(error);
		return {
			code: STATUS_CODE.INTERNAL_ERROR,
			message: error,
			data: null,
		};
	}
}
