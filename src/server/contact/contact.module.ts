import { Message } from "@/server/message/message.module";
import { Timestamp } from "firebase-admin/firestore";

export type Contact = {
    id: string;
    receiver: string;
    sender: string;
    messages: {
        incoming: string[] | Message[];
        outgoing: string[] | Message[];
    }
    established: Date;
};

export type Contact_Input = {
    receiver: FirebaseFirestore.DocumentReference;
    sender: FirebaseFirestore.DocumentReference;
};

export type Contact_Document = {
    receiver: FirebaseFirestore.DocumentReference;
    sender: FirebaseFirestore.DocumentReference;
    messages: {
        incoming: FirebaseFirestore.DocumentReference[];
        outgoing: FirebaseFirestore.DocumentReference[];
    }
    established: Timestamp;
};

