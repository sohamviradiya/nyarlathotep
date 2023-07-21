import { RequestCollection, ContactCollection, UserCollection } from "@/server/firebase/admin.init";
import { FieldValue } from "firebase-admin/firestore";
import { Service_Response, STATUS_CODE } from "@/server/response/response.module";
import { Contact } from "@/server/contact/contact.module";
import { castToContact } from "@/server/contact/contact.util";
import { castToRequest } from "@/server/request/request.util";
import { getUserIDFromToken } from "@/server/auth/auth.service";

export async function establishContact(request_id: string): Promise<Service_Response<null | { contact: Contact }>> {
    const requestRef = await RequestCollection.doc(request_id);
    const request = castToRequest(await requestRef.get());
    const contactRef = await ContactCollection.add({
        sender: await UserCollection.doc(request.sender),
        receiver: await UserCollection.doc(request.receiver),
        messages: [],
        established: new Date(),
    });
    await UserCollection.doc(request.sender).update({
        contacts: FieldValue.arrayUnion(contactRef),
    });

    await UserCollection.doc(request.receiver).update({
        contacts: FieldValue.arrayUnion(contactRef),
    });
    const contact = await contactRef.get();
    await RequestCollection.doc(request_id).delete();
    return {
        code: STATUS_CODE.OK,
        message: "Contact Established",
        data: {
            contact: castToContact(contact)
        }
    }
};

export async function deleteContact(contact_id: string, token: string): Promise<Service_Response<null>> {
    const contactRef = await ContactCollection.doc(contact_id);
    const contact = castToContact(await contactRef.get());

    await UserCollection.doc(contact.sender).update({
        contacts: FieldValue.arrayRemove(contactRef),
    });

    await UserCollection.doc(contact.receiver).update({
        contacts: FieldValue.arrayRemove(contactRef),
    });

    await contactRef.delete();
    return {
        code: STATUS_CODE.OK,
        message: "Contact Deleted",
    };
};

export async function getContact(contact_id: string): Promise<Service_Response<null | { contact: Contact }>> {
    const contactRef = await ContactCollection.doc(contact_id);
    const contact = await contactRef.get();
    return {
        code: STATUS_CODE.OK,
        message: "Contact Retrieved",
        data: {
            contact: castToContact(contact)
        },
    };
};

export async function getContacts(token: string): Promise<Service_Response<null | { contacts: Contact[] }>> {
    const auth_service_response = await getUserIDFromToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
    const profile = (await UserCollection.doc(auth_service_response.data.id).get()).data();
    if (!profile) return {
        code: STATUS_CODE.NOT_FOUND,
        message: "User Profile Not Found",
    };
    const contacts = await Promise.all(
        profile.contacts.map(async (contactRef: FirebaseFirestore.DocumentReference) => {
            return castToContact(await contactRef.get());
        })
    );
    return {
        code: STATUS_CODE.OK,
        message: "Contacts Retrieved",
        data: {
            contacts
        }
    };
};


