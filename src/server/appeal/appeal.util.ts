import { Appeal } from "@/server/appeal/appeal.module";


export function castToAppeal(document: FirebaseFirestore.DocumentSnapshot): Appeal {
    const id = document.id;
    const data = document.data();
    if (!data) return {} as Appeal;
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
