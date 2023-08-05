import { Contact } from "../contact/contact.module";

export enum MESSAGE_DIRECTION {
    INCOMING = "INCOMING",
    OUTGOING = "OUTGOING",
};

export type MESSAGE_DIRECTION_TYPE = keyof typeof MESSAGE_DIRECTION;

export enum MESSAGE_STATUS {
    DRAFT = "DRAFT",
    SENT = "SENT",
    READ = "READ",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
};

export type MESSAGE_STATUS_TYPE = keyof typeof MESSAGE_STATUS;

export type Message = {
    id: string;
    content: string;
    status: keyof typeof MESSAGE_STATUS;
    status_changed: Date;
    contact: string | Contact;
    direction: keyof typeof MESSAGE_DIRECTION;
};


