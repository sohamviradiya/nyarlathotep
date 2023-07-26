import { Message } from "@/server/message/message.module";
import { Timestamp } from "firebase-admin/firestore";

export type Contact = {
    id: string;
    receiver: string;
    sender: string;
    messages: {
        incoming: {
            draft: string[] | Message[];
            sent: string[] | Message[];
            read: string[] | Message[];
            approved: string[] | Message[];
            rejected: string[] | Message[];
        }
        outgoing: {
            draft: string[] | Message[];
            sent: string[] | Message[];
            read: string[] | Message[];
            approved: string[] | Message[];
            rejected: string[] | Message[];
        }
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
        incoming: {
            draft: FirebaseFirestore.DocumentReference[];
            sent: FirebaseFirestore.DocumentReference[];
            read: FirebaseFirestore.DocumentReference[];
            approved: FirebaseFirestore.DocumentReference[];
            rejected: FirebaseFirestore.DocumentReference[];
        }
        outgoing: {
            draft: FirebaseFirestore.DocumentReference[];
            sent: FirebaseFirestore.DocumentReference[];
            read: FirebaseFirestore.DocumentReference[];
            approved: FirebaseFirestore.DocumentReference[];
            rejected: FirebaseFirestore.DocumentReference[];
        }
    }
    established: Timestamp;
};

