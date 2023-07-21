import { User_Private } from "@/server/user/user.module";
import { DocumentReference } from "firebase-admin/firestore";
export enum REQEST_STATUS {
	PENDING = 0,
	RECIEVED = 1,
	ACCEPTED = 2,
	REJECTED = 3,
}

export enum REQUEST_TYPE {
	JOIN = 0,
	MODERATE = 1,
	CONNECT = 2,
	ANNOUNCE = 3,
}

export type Request = {
	id: string;
	sender: string | User_Private;
	type: REQUEST_TYPE;
	status: REQEST_STATUS;
	message: string;
	status_changed: Date;
	receiver: string | User_Private;
};

export type Request_Input = Omit<Request, "id" | "sender" | "receiver">;

export function castToRequest(document: FirebaseFirestore.DocumentSnapshot): Request {
	const id = document.id;
	const data = document.data();
	if (!data) throw new Error("No data found for request: " + id);
	return {
		id,
		sender: data.sender.id,
		type: data.type,
		status: data.status,
		message: data.message,
		status_changed: new Date(data.status_changed._seconds * 1000),
		receiver: data.receiver.id,
	};
}
