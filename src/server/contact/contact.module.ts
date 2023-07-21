import { Message } from "@/server/message/message.module";

export type Contact = {
	id: string;
	receiver: string;
	sender: string;
	messages: string[] | Message[];
	established: Date;
};

export function castContact(document: FirebaseFirestore.DocumentSnapshot): Contact {
	const id = document.id;
	const data = document.data();
	if (!data) throw new Error("No data found for contact: " + id);
	return {
		id,
		receiver: data.receiver.id,
		sender: data.sender.id,
		messages: data.messages.map((message: FirebaseFirestore.DocumentReference) => message.id),
		established: new Date(data.established._seconds * 1000),
	};
}
