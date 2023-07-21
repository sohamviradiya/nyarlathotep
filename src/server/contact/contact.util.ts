import { Contact } from "@/server/contact.module";

export function castToContact(document: FirebaseFirestore.DocumentSnapshot) : Contact {
    const id = document.id;
    const data = document.data();
    if (!data) return {} as Contact;
    return {
        id,
        sender: data.sender.id,
        receiver: data.receiver.id,
        messages: data.messages,
        established: new Date(data.established._seconds * 1000),
    };
}