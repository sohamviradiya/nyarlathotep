import {
    APPEAL_STATUS,
    APPEAL_TYPE_ENUM,
    Appeal,
    Appeal_Input,
} from "@/server/appeal/appeal.module";
import { castToAppeal } from "@/server/appeal/appeal.util";
import { Service_Response, STATUS_CODES } from "@/server/response/response.module";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { establishContact } from "@/server/contact/contact.service";
import { checkModerationAccessWithToken } from "@/server/community/community.service";
import { castToCommunityPrivate, getMemberRole } from "@/server/community/community.util";
import { Announcement, Announcement_Document, MEMBER_ROLE, Member_Document } from "@/server/community/community.module";
import { verifyClientToken } from "@/server/auth/auth.service";
import AdminApp from "@/server/firebase/admin.init";
import { Contact } from "../contact/contact.module";

const {
    AppealCollection,
    AnnouncementCollection,
} = AdminApp;

export async function getAppeal(
    id: string, token: string
): Promise<Service_Response<null | {
    appeal: Appeal
}>> {
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
    const appealRef = await AppealCollection.doc(id);
    const appealDoc = await appealRef.get();
    if (!appealDoc.exists) {
        return {
            code: STATUS_CODES.NOT_FOUND,
            message: "Appeal not found",
        }
    };
    const appeal = castToAppeal(await appealRef.get());
    if (appeal.sender != auth_service_response.data.email && appeal.receiver != auth_service_response.data.email) {
        return {
            code: STATUS_CODES.FORBIDDEN,
            message: "You are not authorized to view this appeal",
        }
    }
    return {
        code: STATUS_CODES.OK,
        message: "Appeal fetched",
        data: {
            appeal
        }
    };
};

export async function sendAppeal(
    appeal: Appeal_Input, token: string
): Promise<Service_Response<null | {
    appeal: Appeal
}>> {
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
    const senderRef = await AdminApp.UserCollection.doc(auth_service_response.data.email);
    if (appeal.type == "CONNECT") {
        const receiverRef = await AdminApp.UserCollection.doc(appeal.receiver as string);
        await AppealCollection.doc(`${senderRef.id}~${receiverRef.id}`).set({
            sender: senderRef,
            type: appeal.type,
            status: APPEAL_STATUS.PENDING,
            message: appeal.message,
            status_changed: Timestamp.now(),
            receiver: receiverRef,
        });
        const appealRef = await AppealCollection.doc(`${senderRef.id}~${receiverRef.id}`);
        senderRef.update({
            appeals: FieldValue.arrayUnion(appealRef)
        });

        receiverRef.update({
            invitations: FieldValue.arrayUnion(appealRef)
        });

        return {
            code: STATUS_CODES.OK,
            message: `Appeal to connect to ${receiverRef.id} sent`,
            data: {
                appeal: castToAppeal(await appealRef.get())
            }
        };
    }
    else {
        const receiverRef = await AdminApp.CommunityCollection.doc(appeal.receiver as string);
        if (appeal.type == "MODERATE" || appeal.type == "ANNOUNCE") {
            const community = castToCommunityPrivate(await receiverRef.get());
            const role_service_response = await getMemberRole(community, senderRef.id);
            if (!role_service_response.data) return role_service_response as Service_Response<null>;
        };
        AppealCollection.doc(`${senderRef.id}~${receiverRef.id}.${appeal.type}`).set({
            sender: senderRef,
            type: appeal.type,
            status: APPEAL_STATUS.PENDING,
            message: appeal.message,
            status_changed: Timestamp.now(),
            receiver: receiverRef,
        });

        const appealRef = await AppealCollection.doc(`${senderRef.id}~${receiverRef.id}`);

        senderRef.update({
            appeals: FieldValue.arrayUnion(appealRef)
        });
        receiverRef.update({
            appeals: FieldValue.arrayUnion(appealRef)
        });

        return {
            code: STATUS_CODES.OK,
            message: `Appeal to ${appeal.type} in ${receiverRef.id} community sent`,
            data: {
                appeal: castToAppeal(await appealRef.get()),
            }
        };
    }
}

export async function withdrawAppeal(appeal_id: string, token: string): Promise<Service_Response<null>> {
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
    const appealRef = AppealCollection.doc(appeal_id);
    if (!appealRef) return {
        code: STATUS_CODES.NOT_FOUND,
        message: `No appeal found with id ${appeal_id}`,
    };
    const appeal = castToAppeal(await appealRef.get());
    if (!appeal) {
        return {
            code: STATUS_CODES.NOT_FOUND,
            message: `No appeal found with id ${appeal_id}`,
        };
    }

    if (appeal.sender != auth_service_response.data.email)
        return {
            code: STATUS_CODES.FORBIDDEN,
            message: "You are not authorized to withdraw this appeal",
        }

    const senderRef = await AdminApp.UserCollection.doc(appeal.sender as string);
    senderRef.update({
        appeals: FieldValue.arrayRemove(appealRef)
    });

    if (appeal.type == APPEAL_TYPE_ENUM.CONNECT) {
        const receiverRef = await AdminApp.UserCollection.doc(appeal.receiver as string);
        receiverRef.update({
            invitations: FieldValue.arrayRemove(appealRef)
        });
    }
    else {
        const receiverRef = await AdminApp.CommunityCollection.doc(appeal.receiver as string);
        receiverRef.update({
            appeals: FieldValue.arrayRemove(appealRef)
        });
    }
    await appealRef.delete();
    return {
        code: STATUS_CODES.OK,
        message: `Appeal ${appeal_id} withdrawn`,
    };
};

export async function markAppeal(appeal_id: string, token: string): Promise<Service_Response<null | {
    appeal: Appeal
}>> {
    const appealRef = AppealCollection.doc(appeal_id);
    const appeal = castToAppeal(await appealRef.get());
    if (!appeal) {
        return {
            code: STATUS_CODES.NOT_FOUND,
            message: `No appeal found with id ${appeal_id}`,
        };
    }
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
    if (auth_service_response.data.email != appeal.receiver) {
        return {
            code: STATUS_CODES.FORBIDDEN,
            message: `You are not authorized to mark appeal ${appeal_id}`,
        };
    }
    else {
        await appealRef.update({
            status: APPEAL_STATUS.UNDER_REVIEW,
            status_changed: Timestamp.now(),
        });
        return {
            code: STATUS_CODES.OK,
            message: `Appeal ${appeal_id} marked for review`,
            data: {
                appeal
            }
        };
    }
}


export async function acceptAppeal(appeal_id: string, token: string): Promise<Service_Response<null | {
    contact: Contact
}>> {
    const appealRef = AppealCollection.doc(appeal_id);
    const appeal = castToAppeal(await appealRef.get());
    var message = "";
    var data = null;
    if (appeal.type == APPEAL_TYPE_ENUM.CONNECT) {
        const auth_service_response = await verifyClientToken(token);
        if (!auth_service_response.data)
            return auth_service_response as Service_Response<null>;
        if (auth_service_response.data.email != appeal.receiver)
            return {
                code: STATUS_CODES.FORBIDDEN,
                message: `You are not authorized to confirm appeal ${appeal_id}`,
            };
        message = "Your appeal to connect with " + appeal.receiver + " has been accepted";

        const contact_service_response = await establishContact(appeal);

        if (!contact_service_response.data)
            return contact_service_response as Service_Response<null>;
        data = contact_service_response.data;
    }
    else {
        const communityRef = AdminApp.CommunityCollection.doc(appeal.receiver as string);
        const community = castToCommunityPrivate(await communityRef.get());

        const auth_service_response = await checkModerationAccessWithToken(community, token);
        if (!auth_service_response.data) return auth_service_response as Service_Response<null>;

        const senderRef = await AdminApp.UserCollection.doc(appeal.sender as string);

        if (appeal.type == APPEAL_TYPE_ENUM.JOIN) {
            message = "Your appeal to join " + community.name + " has been accepted";
            await communityRef.update({
                members: FieldValue.arrayRemove({
                    user: senderRef,
                    role: MEMBER_ROLE.BANNED
                } as Member_Document)
            });
            await communityRef.update({
                members: FieldValue.arrayUnion({
                    user: senderRef,
                    role: MEMBER_ROLE.PARTICIPANT,
                } as Member_Document)
            });

        }
        else if (appeal.type == APPEAL_TYPE_ENUM.MODERATE) {
            message = "Your appeal to moderate " + community.name + " has been accepted";

            await communityRef.update({
                members: FieldValue.arrayRemove({
                    user: senderRef,
                    role: MEMBER_ROLE.PARTICIPANT
                } as Member_Document)
            });

            await communityRef.update({
                members: FieldValue.arrayUnion({
                    user: senderRef,
                    role: MEMBER_ROLE.MODERATOR,
                } as Member_Document)
            });
        }
        else if (appeal.type == APPEAL_TYPE_ENUM.ANNOUNCE) {
            const role_service_response = await getMemberRole(community, senderRef.id);
            if (!role_service_response.data) return role_service_response as Service_Response<null>;

            message = "Your appeal to announce in " + community.name + " has been accepted";
            const id = `${community.id}.${Timestamp.now().seconds}`;
            await AnnouncementCollection.doc(`${community.id}.${Timestamp.now().seconds}`).set({
                content: appeal.message,
                user: senderRef,
                time: Timestamp.now(),
            });
            await communityRef.update({
                announcements: FieldValue.arrayUnion(AnnouncementCollection.doc(id))
            });
        }
        else {
            return {
                code: STATUS_CODES.NOT_FOUND,
                message: `No appeal found with id ${appeal_id}`,
            };
        }
    }
    await appealRef.update({
        status: APPEAL_STATUS.ACCEPTED,
        status_changed: Timestamp.now(),
        message
    });

    return {
        code: STATUS_CODES.OK,
        message,
        data
    }

}

export async function rejectAppeal(appeal_id: string, token: string): Promise<Service_Response<null>> {
    const appealRef = AppealCollection.doc(appeal_id);
    const appeal = castToAppeal(await appealRef.get());
    if (!appeal) {
        return {
            code: STATUS_CODES.NOT_FOUND,
            message: `No appeal found with id ${appeal_id}`,
        };
    }
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
    if (auth_service_response.data.email == appeal.receiver) {
        return {
            code: STATUS_CODES.FORBIDDEN,
            message: `You are not authorized to reject appeal ${appeal_id}`,
        };
    }
    if (appeal.status == APPEAL_STATUS.ACCEPTED) {
        return {
            code: STATUS_CODES.BAD_REQUEST,
            message: `Appeal ${appeal_id} has already been accepted`,
        };
    };
    var message = "";
    if (appeal.type == APPEAL_TYPE_ENUM.CONNECT)
        message = "Your appeal to connect with " + appeal.receiver + " has been rejected";
    else if (appeal.type == APPEAL_TYPE_ENUM.JOIN)
        message = "Your appeal to join " + appeal.receiver + " has been rejected";
    else if (appeal.type == APPEAL_TYPE_ENUM.MODERATE)
        message = "Your appeal to moderate " + appeal.receiver + " has been rejected";
    else if (appeal.type == APPEAL_TYPE_ENUM.ANNOUNCE)
        message = "Your appeal to announce in " + appeal.receiver + " has been rejected";
    else
        return {
            code: STATUS_CODES.BAD_REQUEST,
            message: `Appeal ${appeal_id} is in an unknown state`,
        };
    await appealRef.update({
        status: APPEAL_STATUS.REJECTED,
        status_changed: Timestamp.now(),
        message
    });

    return {
        code: STATUS_CODES.OK,
        message: `Appeal ${appeal_id} rejected`,
    }

}
