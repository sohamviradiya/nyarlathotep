import { Timestamp } from "firebase-admin/firestore";

export type Announcement = {
    content: string;
    user: string;
    time: Date;
};

export type Announcement_Input = Omit<Announcement, "user" | "time">;

export type Announcement_Document = Omit<Announcement, "user" | "time"> & {
    user: FirebaseFirestore.DocumentReference;
    time: Timestamp;
}

export enum MEMBER_ROLE {
    ADMIN = "ADMIN",
    MODERATOR = "MODERATOR",
    PARTICIPANT = "PARTICIPANT",
    BANNED = "BANNED",
}

export type MEMBER_ROLE_TYPE = keyof typeof MEMBER_ROLE;

export type Member = {
    user: string;
    role: MEMBER_ROLE_TYPE;
}

export type Member_Document = Omit<Member, "user"> | {
    user: FirebaseFirestore.DocumentReference;
};

export type Community_Private = {
    id: string;
    name: string;
    description: string;
    members: Member[];
    founded: Date;
    appeals: string[];
    announcements: Announcement[];
};

export type Community_Member_Level = Omit<Community_Private, "appeals">;

export type Community_Public = Omit<Community_Member_Level, "members" | "announcements">;

export type Community_Input = Omit<Community_Public, "id" | "founded">;
