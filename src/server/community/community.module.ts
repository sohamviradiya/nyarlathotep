
export type Announcement = {
    content: string;
    user: string;
    time: Date;
};

export enum MEMBER_ROLE {
    ADMIN = "ADMIN",
    MODERATOR = "MODERATOR",
    USER = "USER",
    OBSERVER = "OBSERVER",
}

export type MEMBER_ROLE_TYPE = keyof typeof MEMBER_ROLE;

export type Member = {
    user: string;
    role: MEMBER_ROLE_TYPE;
}

export type Community_Private = {
    id: string;
    name: string;
    description: string;
    members: Member[];
    founded: Date;
    requests: string[];
    announcements: Announcement[];
};

export type Community_Member_Level = Omit<Community_Private, "requests">;

export type Community_Public = Omit<Community_Member_Level, "members" | "announcements">;

export type Community_Input = Omit<Community_Public, "id">;
