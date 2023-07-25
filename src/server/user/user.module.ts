import { UnionType } from "typescript";

export type User_Private = {
    id: string;
    email: string;
    name: string;
    address?: string;
    bio?: string;
    joined: Date;
    communities: string[];
    contacts: string[];
    requests: string[];
    invitations: string[];
    last_online: Date;
};

export type User_Public = Omit<User_Private, "contacts" | "requests" | "invitations">;

export type User_Input = Omit<User_Public, "id" | "communities" | "joined" | "last_online"> & {
    password: string;
}