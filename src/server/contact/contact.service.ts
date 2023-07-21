import { RequestCollection, ContactCollection, UserCollection } from "@/server/firebase/admin.init";
import { FieldValue } from "firebase-admin/firestore";
import { Service_Response, STATUS_CODE } from "@/server/util/protocol.module";
import { Contact, castContact } from "./contact.module";
import { getProfileFromToken } from "@/server/user/user.service";
import { getUserIDFromToken, verifyClientToken } from "../auth/auth.service";

export async function eastablishContact(request_id: string): Promise<Service_Response<null | { contact: Contact }>> {
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
        data: {
            contact: castContact(contact)
        }
    }
}

export async function deleteContact(contact_id: string, token: string): Promise<Service_Response<null>> {
    const contact = await ContactCollection.doc(contact_id).get();
    if (!contact.exists) throw new Error("Contact does not exist");
    const contact_details = contact.data();
    if (!contact_details) throw new Error("Contact does not exist");

    const auth_service_response = await getUserIDFromToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
    const id = auth_service_response.data.id;
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
}

export async function getContact(contact_id: string, token: string): Promise<Service_Response<null | {
    contact: Contact;
}>> {
    const contact = await ContactCollection.doc(contact_id).get();
    if (!contact.exists) throw new Error("Contact does not exist");
    const contact_details = contact.data();
    if (!contact_details) throw new Error("Contact does not exist");
    const auth_response = await getUserIDFromToken(token);
    if (!auth_response.data) return auth_response as Service_Response<null>;
    const id = auth_response.data.id;
    if (contact_details.sender.id != id && contact_details.receiver.id != id) {
        return {
            code: STATUS_CODE.UNAUTHORIZED,
            message: "User does not have access to this contact",
            data: null,
        };
    }
    return {
        code: STATUS_CODE.OK,
        message: "Contact Retrieved",
        data: {
            contact: castContact(contact)
        },
    };
}

export async function getContacts(token: string): Promise<Service_Response<null | {
    contacts: Contact[];
}>> {
    const profile_service_response = await getProfileFromToken(token);
    if (!profile_service_response.data) return profile_service_response as Service_Response<null>;
    const contact_list = profile_service_response.data.user.contacts;
    if (contact_list.length == 0)
        return {
            code: STATUS_CODE.NOT_FOUND,
            message: `No Contacts for ${profile_service_response.data.user.name}`,
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
        data: {
            contacts: contact_details
        }
    };
}
