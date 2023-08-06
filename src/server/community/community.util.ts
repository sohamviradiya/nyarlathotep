import { Service_Response, STATUS_CODES } from "@/server/response/response.module";
import { Announcement, Community_Private, MEMBER_ROLE, MEMBER_ROLE_TYPE } from "@/server/community/community.module";
import { Community_Public } from "@/server/community/community.module";

import { DocumentReference, DocumentSnapshot } from "firebase-admin/firestore";
import { Forbidden } from "../response/response.util";
export async function checkModerationAccess(community: Community_Private, user_id: string): Promise<Service_Response<null | { role: MEMBER_ROLE_TYPE; }>> {
    const role_service_response = await getMemberRole(community, user_id);
    if (!role_service_response.data) return role_service_response as Service_Response<null>;
    if (role_service_response.data.role != MEMBER_ROLE.ADMIN && role_service_response.data.role != MEMBER_ROLE.MODERATOR)
        return Forbidden({ message: `You are not authorized to moderate community ${community.name}` });

    return role_service_response;
}


export function castToCommunity(document: FirebaseFirestore.DocumentSnapshot) {
    const id = document.id;
    const data = document.data();
    if (!data) throw new Error("No data found for community: " + id);
    return {
        id,
        name: data.name,
        description: data.description,
        founded: new Date(data.founded._seconds * 1000),
    };
};

export function castToCommunityPrivate(document: FirebaseFirestore.DocumentSnapshot): Community_Private {
    const id = document.id;
    const data = document.data();
    if (!data) throw new Error("No data found for community: " + id);
    return {
        id,
        name: data.name,
        description: data.description,
        founded: new Date(data.founded._seconds * 1000),
        announcements: data.announcements.map((announcement: DocumentReference) => announcement.id),
        members: data.members.map((member: any) => {
            return {
                user: member.user.id,
                role: member.role
            }
        }),
        appeals: data.appeals.map((appeal: DocumentReference) => appeal.id),
    };
}

export function castToAnnouncement(announcement: DocumentSnapshot): Announcement {
    const id = announcement.id;
    const data = announcement.data();
    if (!data) throw new Error("No data found for announcement: " + id);
    return {
        id,
        content: data.content,
        user: data.user.id,
        time: new Date(data.time.seconds * 1000)
    };
}

export function generateHexString(): string {
    const random_number = Math.floor(Math.random() * Math.pow(16, 8));
    const random_number_string = random_number.toString(16);
    return String("0").repeat(8 - random_number_string.length).concat(random_number_string);
}


export function getMemberRole(community: Community_Private, user_id: string): Service_Response<null | { role: MEMBER_ROLE_TYPE }> {
    const member = community.members.find(member => member.user == user_id);
    if (!member)
        return Forbidden({ message: `You are not member of community ${community.name}`, });
    const role = member.role;
    return {
        code: STATUS_CODES.OK,
        message: `User role in community ${community.name}`,
        data: {
            role,
        }
    }
}