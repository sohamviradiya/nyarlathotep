import { Contact, Contact_Document, Contact_Input } from "@/server/contact/contact.module";
import { Timestamp } from "firebase-admin/firestore";

export function castToContact(document: FirebaseFirestore.DocumentSnapshot) {
    const id = document.id;
    const data = document.data();
    if (!data) return {} as Contact;
    return JSON.parse(JSON.stringify({
        id,
        sender: data.sender.id,
        receiver: data.receiver.id,
        messages: Object.keys(data.messages).reduce((tag, key) => {
            tag[key] = Object.keys(data.messages[key]).reduce((sub_tag, sub_key) => {
                sub_tag[sub_key] = data.messages[key][sub_key].map((message: FirebaseFirestore.DocumentReference) => message.id);
                return sub_tag;
            }, {} as { [key: string]: string[] });
            return tag;
        }, {} as { [key: string]: { [key: string]: string[] } }) as Contact["messages"],
        established: new Date(data.established._seconds * 1000),
    }));
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