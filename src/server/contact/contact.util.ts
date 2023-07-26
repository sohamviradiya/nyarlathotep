import { Contact, Contact_Document, Contact_Input } from "@/server/contact/contact.module";
import { DocumentReference, Timestamp } from "firebase-admin/firestore";

export function castToContact(document: FirebaseFirestore.DocumentSnapshot) {
    const id = document.id;
    const data = document.data();
    if (!data) return {} as Contact;

    return {
        id,
        sender: data.sender.id,
        receiver: data.receiver.id,
        messages: {
            incoming: {
                draft: extractIDs(data.messages.incoming.draft),
                sent: extractIDs(data.messages.incoming.sent),
                read: extractIDs(data.messages.incoming.read),
                approved: extractIDs(data.messages.incoming.approved),
                rejected: extractIDs(data.messages.incoming.rejected),
            },
            outgoing: {
                draft: extractIDs(data.messages.outgoing.draft),
                sent: extractIDs(data.messages.outgoing.sent),
                read: extractIDs(data.messages.outgoing.read),
                approved: extractIDs(data.messages.outgoing.approved),
                rejected: extractIDs(data.messages.outgoing.rejected),
            },
        },
        established: new Date(data.established._seconds * 1000),
    };
}

function extractIDs(messages: DocumentReference[]) {
    if (!messages?.length) return [];
    return messages.map((message: DocumentReference) => message.id);
}

export function castInputToDocument(input: Contact_Input): Contact_Document {
    return {
        sender: input.sender,
        receiver: input.receiver,
        messages: {
            incoming: {
                draft: [],
                sent: [],
                read: [],
                approved: [],
                rejected: [],
            },
            outgoing: {
                draft: [],
                sent: [],
                read: [],
                approved: [],
                rejected: [],
            },
        },
        established: Timestamp.now(),
    };
}