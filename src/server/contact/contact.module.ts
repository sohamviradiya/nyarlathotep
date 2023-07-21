import { Message } from "@/server/message/message.module";

export type Contact = {
    id: string;
    receiver: string;
    sender: string;
    messages: string[] | Message[];
    established: Date;
};

