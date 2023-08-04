import { Contact, Contact_Document, Contact_Input } from "@/server/contact/contact.module";
import { DocumentReference, Timestamp } from "firebase-admin/firestore";

export function castToContact(document: FirebaseFirestore.DocumentSnapshot): Contact {
    const id = document.id;
    const data = document.data();
    if (!data) return {} as Contact;

    return {
        id,
        sender: data.sender.id,
        receiver: data.receiver.id,
        messages: {
            incoming: data.messages.map((message: DocumentReference) => message.id),
            outgoing: data.messages.map((message: DocumentReference) => message.id),
        },
        established: new Date(data.established._seconds * 1000),
    };
}

export function castInputToDocument(input: Contact_Input): Contact_Document {
    return {
        sender: input.sender,
        receiver: input.receiver,
        messages: {
            incoming: [],
            outgoing: []
        },
        established: Timestamp.now(),
    };
}