export enum MESSAGE_STATUS {
    DRAFT = "DRAFT",
    SENT = "SENT",
    READ = "READ",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export type MESSAGE_STATUS_TYPE = keyof typeof MESSAGE_STATUS;

export enum MESSAGE_DIRECTION {
    OUTGOING = "OUTGOING",
    INCOMING = "INCOMING",
}

export type Message = {
    id: string;
    content: string;
    direction: keyof typeof MESSAGE_DIRECTION;
    status: keyof typeof MESSAGE_STATUS;
    status_changed: Date;
};


