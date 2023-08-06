import { AppealCollection, ContactCollection, UserCollection } from "@/server/firebase/admin.init";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { Service_Response, STATUS_CODES } from "@/server/response/response.module";
import { Contact } from "@/server/contact/contact.module";
import { castInputToDocument, castToContact } from "@/server/contact/contact.util";
import { verifyClientToken } from "../auth/auth.service";
import { Appeal, APPEAL_STATUS } from "../appeal/appeal.module";


export async function establishContact(appeal: Appeal): Promise<Service_Response<null | { contact: Contact }>> {
    const senderRef = UserCollection.doc(appeal.sender);
    const receiverRef = UserCollection.doc(appeal.receiver);
    await ContactCollection.doc(`${appeal.sender}~${appeal.receiver}`).set(castInputToDocument({
        sender: senderRef,
        receiver: receiverRef,
    }));
    const contactRef = await ContactCollection.doc(`${appeal.sender}~${appeal.receiver}`);
    await senderRef.update({
        contacts: FieldValue.arrayUnion(contactRef),
    });
    await receiverRef.update({
        contacts: FieldValue.arrayUnion(contactRef),
    });
    const contact = await contactRef.get();
    return {
        code: STATUS_CODES.OK,
        message: "Contact Established",
        data: {
            contact: castToContact(contact)
        }
    }
};

export async function deleteContact(contact_id: string, token: string): Promise<Service_Response<null>> {
    const contactRef = await ContactCollection.doc(contact_id);
    const contactDoc = await contactRef.get();
    const contact = castToContact(contactDoc);
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
    if (contact.sender !== auth_service_response.data.email && contact.receiver !== auth_service_response.data.email)
        return {
            code: STATUS_CODES.UNAUTHORIZED,
            message: "Unauthorized",
        };

    await UserCollection.doc(contact.sender).update({
        contacts: FieldValue.arrayRemove(contactRef),
    });

    await UserCollection.doc(contact.receiver).update({
        contacts: FieldValue.arrayRemove(contactRef),
    });
    var rejectionReceiver = auth_service_response.data.email === contact.sender ? contact.receiver : contact.sender;

    await AppealCollection.doc(`${auth_service_response.data.email}~${rejectionReceiver}`).set({
        sender: UserCollection.doc(auth_service_response.data.email),
        receiver: UserCollection.doc(rejectionReceiver),
        status: APPEAL_STATUS.REJECTED,
        status_changed: Timestamp.now(),
    });
    await contactRef.delete();
    return {
        code: STATUS_CODES.OK,
        message: "Contact Deleted",
    };
};

export async function getContact(contact_id: string, token: string): Promise<Service_Response<null | { contact: Contact }>> {
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;

    const contactRef = await ContactCollection.doc(contact_id);
    const contactDoc = await contactRef.get();
    const contact = castToContact(contactDoc);
    var messages = {
        incoming: [] as string[],
        outgoing: [] as string[],
    };

    if (contact.sender == auth_service_response.data.email) {
        messages.incoming = contact.messages.incoming as string[];
        messages.outgoing = contact.messages.outgoing as string[];
    }
    else if (contact.receiver == auth_service_response.data.email) {
        messages.incoming = contact.messages.outgoing as string[];
        messages.outgoing = contact.messages.incoming as string[];
    }
    else
        return {
            code: STATUS_CODES.UNAUTHORIZED,
            message: "Unauthorized",
        };

    return {
        code: STATUS_CODES.OK,
        message: "Contact Retrieved",
        data: {
            contact: {
                ...contact,
                messages
            },
        }
    };
};


