import { Service_Response, STATUS_CODE } from "@/server/response/response.module";
import { Community_Private, MEMBER_ROLE, MEMBER_ROLE_TYPE } from "@/server/community/community.module";
import { getMemberRole } from "@/server/community/community.service";
import { Community_Input, Community_Public } from "@/server/community/community.module";

import { DocumentReference } from "firebase-admin/firestore";
export async function checkModerationAccess(community: Community_Private, user_id: string): Promise<Service_Response<null | { role: MEMBER_ROLE_TYPE; }>> {
    const role_service_response = await getMemberRole(community, user_id);
    if (!role_service_response.data) return role_service_response as Service_Response<null>;
    if (role_service_response.data.role != MEMBER_ROLE.ADMIN && role_service_response.data.role != MEMBER_ROLE.MODERATOR)
        return {
            code: STATUS_CODE.FORBIDDEN,
            message: `User ${user_id} is not authorized to moderate community ${community.name}`,
        };
    return role_service_response;
}

export function castInputToCommunity(
    input: Community_Input
): Omit<Community_Private, "id"> {
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
        announcements: data.announcements.map((announcement: any) => {
            return {
                title: announcement.title,
                content: announcement.content,
                user: announcement.user.id,
                time: new Date(announcement.time._seconds * 1000),
            }
        }),
        members: data.members.map((member: any) => {
            return {
                user: member.user.id,
                role: member.role
            }
        }),
        requests: data.requests.map((request: DocumentReference) => request.id),
    };
}
