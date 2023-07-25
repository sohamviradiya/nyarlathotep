import { Service_Response, STATUS_CODES } from "@/server/response/response.module";
import { Announcement, Announcement_Document, Community_Private, MEMBER_ROLE, MEMBER_ROLE_TYPE } from "@/server/community/community.module";
import { getMemberRole } from "@/server/community/community.service";
import { Community_Input, Community_Public } from "@/server/community/community.module";

import { DocumentReference } from "firebase-admin/firestore";
export async function checkModerationAccess(community: Community_Private, user_id: string): Promise<Service_Response<null | { role: MEMBER_ROLE_TYPE; }>> {
    const role_service_response = await getMemberRole(community, user_id);
    if (!role_service_response.data) return role_service_response as Service_Response<null>;
    if (role_service_response.data.role != MEMBER_ROLE.ADMIN && role_service_response.data.role != MEMBER_ROLE.MODERATOR)
        return {
            code: STATUS_CODES.FORBIDDEN,
            message: `You are not authorized to moderate community ${community.name}`,
        };
    return role_service_response;
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
        announcements: castToAnnouncements(data.announcements),
        members: data.members.map((member: any) => {
            return {
                user: member.user.id,
                role: member.role
            }
        }),
        appeals: data.appeals.map((appeal: DocumentReference) => appeal.id),
    };
}

export function castToAnnouncements(announcements: Announcement_Document[]): Announcement[] {
    return announcements.map((announcement) => {
        return {
            content: announcement.content,
            user: announcement.user.id,
            time: new Date(announcement.time.seconds * 1000)
        }
    })
}

export function generateHexString(): string {
    const random_number = Math.floor(Math.random() * Math.pow(16, 8));
    const random_number_string = random_number.toString(16);
    return String("0").repeat(8 - random_number_string.length).concat(random_number_string);
}

