import { Appeal } from "../appeal/appeal.module";
import { Community_Public } from "../community/community.module";

export type User_Private = {
    id: string;
    email: string;
    name: string;
    address?: string;
    bio?: string;
    joined: Date;
    communities: string[] | Community_Public[];
    contacts: string[];
    appeals: string[] | Appeal[];
    invitations: string[] | Appeal[];
    last_online: Date;
};

export type User_Public = Omit<User_Private, "contacts" | "appeals" | "invitations">;

export type User_Input = Omit<User_Public, "id" | "communities" | "joined" | "last_online"> & {
    password: string;
}