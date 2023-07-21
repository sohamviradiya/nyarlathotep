import { Request } from "@/server/request/request.module";


export function castToRequest(document: FirebaseFirestore.DocumentSnapshot): Request {
    const id = document.id;
    const data = document.data();
    if (!data) return {} as Request;
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
