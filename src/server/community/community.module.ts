import { User_Private, User_Public } from "@/src/user/user.module";

export type Announcement = {
	title: string;
	content: string;
	user: string | User_Public;
	time: Date;
};

export type Member = {
	user: string | User_Public;
	role: MEMBER_ROLE;
};

export enum MEMBER_ROLE {
	ADMIN = 0,
	MODERATOR = 1,
	USER = 2,
	OBSERVER = 3,
}

export type Community_Moderator_Level = {
	id: string;
	name: string;
	description: string;
	members: Member[];
	founded: Date;
	requests: string[];
	announcements: Announcement[];
};

export type Community_Member_Level = Omit<Community_Moderator_Level, "requests">;

export type Community_Public = Omit<Community_Member_Level, "members">;

export type Community_Input = Omit<Community_Public, "id" | "announcements">;

export function castInputToCommunity(
	input: Community_Input
): Omit<Community_Moderator_Level, "id"> {
	return {
		name: input.name,
		description: input.description,
		founded: input.founded,
		members: [],
		requests: [],
		announcements: [],
	};
}

export function castToCommunity(document: FirebaseFirestore.DocumentSnapshot): Community_Public {
	const id = document.id;
	const data = document.data();
	if (!data) throw new Error("No data found for community: " + id);
	return {
		id,
		name: data.name,
		description: data.description,
		founded: new Date(data.founded._seconds * 1000),
		announcements: data.announcements,
	};
};

