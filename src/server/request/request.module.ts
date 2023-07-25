export enum REQUEST_STATUS {
    PENDING = "PENDING",
    RECEIVED = "RECEIVED",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
};

export enum REQUEST_TYPE {
    JOIN = "JOIN",
    MODERATE = "MODERATE",
    CONNECT = "CONNECT",
    ANNOUNCE = "ANNOUNCE",
};

export type REQUEST_STATUS_TYPE = keyof typeof REQUEST_STATUS;

export type Request = {
    id: string;
    sender: string;
    type: keyof typeof REQUEST_TYPE;
    status: REQUEST_STATUS_TYPE;
    message: string;
    status_changed: Date;
    receiver: string;
};

export type Request_Input = Omit<Request, "id" | "sender" | "status" | "status_changed">;


