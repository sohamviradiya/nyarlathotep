export enum APPEAL_STATUS {
    PENDING = "PENDING",
    UNDER_REVIEW = "UNDER_REVIEW",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
};

export enum APPEAL_TYPE_ENUM {
    JOIN = "JOIN",
    MODERATE = "MODERATE",
    CONNECT = "CONNECT",
    ANNOUNCE = "ANNOUNCE",
};

export type APPEAL_TYPE = keyof typeof APPEAL_TYPE_ENUM;

export type APPEAL_STATUS_TYPE = keyof typeof APPEAL_STATUS;

export type Appeal = {
    id: string;
    sender: string;
    type: APPEAL_TYPE;
    status: APPEAL_STATUS_TYPE;
    message: string;
    status_changed: Date;
    receiver: string;
};

export type Appeal_Input = Omit<Appeal, "id" | "sender" | "status" | "status_changed">;


