export enum MESSAGE_STATUS {
	DRAFT = 0,
	SENT = 1,
	READ = 2,
	APPROVED = 3,
	REJECTED = 4,
}

export enum MESSAGE_DIRECTION {
	OUTGOING = 0,
	INCOMING = 1,
}

export type Message = {
	id: string;
	content: string;
	direction: MESSAGE_DIRECTION;
	status: MESSAGE_STATUS;
	status_changed: Date;
};

export function castMessage(message: FirebaseFirestore.DocumentSnapshot): Message {
	const id = message.id;
	const data = message.data()?.content;
	return {
		id,
		content: data.content,
		direction: data.direction,
		status: data.status,
		status_changed: data.status_changed.toDate(),
	};
}
