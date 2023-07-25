import { getProfileFromToken } from "@/server/user/user.service";
import {
    APPEAL_STATUS,
    APPEAL_TYPE,
    Appeal,
    Appeal_Input,
} from "@/server/appeal/appeal.module";
import { castToAppeal } from "@/server/appeal/appeal.util";
import { Service_Response, STATUS_CODES } from "@/server/response/response.module";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { establishContact } from "@/server/contact/contact.service";
import { checkModerationAccessWithToken, getMemberRole } from "@/server/community/community.service";
import { castToCommunityPrivate } from "@/server/community/community.util";
import { Announcement_Document, MEMBER_ROLE, Member_Document } from "@/server/community/community.module";
import { verifyClientToken } from "@/server/auth/auth.service";
import AdminApp from "@/server/firebase/admin.init";

const {
    AppealCollection
} = AdminApp;

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
        AppealCollection.doc(`${senderRef.id}~${receiverRef.id}`).set({
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

export async function withdrawAppeal(receiver: string, token: string): Promise<Service_Response<null>> {
    const auth_service_response = await verifyClientToken(token);
    if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
    const appeal_id = `${auth_service_response.data.email}~${receiver}`;
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
    if (appeal.status != APPEAL_STATUS.PENDING) {
        return {
            code: STATUS_CODES.FORBIDDEN,
            message: `Appeal ${appeal_id} cannot be withdrawn`,
        };
    }
    const senderRef = await AdminApp.UserCollection.doc(appeal.sender as string);
    senderRef.update({
        appeals: FieldValue.arrayRemove(appealRef)
    });
    if (appeal.type == "CONNECT") {
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

export async function confirmAppeal(appeal_id: string, decision: string, token: string): Promise<Service_Response<null>> {
    const appealRef = AppealCollection.doc(appeal_id);
    const appeal = castToAppeal(await appealRef.get());

    if (appeal.type == APPEAL_TYPE.CONNECT) {
        const auth_service_response = await verifyClientToken(token);
        if (!auth_service_response.data)
            return auth_service_response as Service_Response<null>;
        if (auth_service_response.data.email != appeal.receiver)
            return {
                code: STATUS_CODES.FORBIDDEN,
                message: `You are not authorized to confirm appeal ${appeal_id}`,
            };
      
        if (decision == APPEAL_STATUS.ACCEPTED) {  
            await appealRef.update({
                status: APPEAL_STATUS.ACCEPTED,
                status_changed: Timestamp.now(),
                message: "Your appeal to connect with " + appeal.receiver + " has been accepted",
            });
        
            const contact_service_response = await establishContact(appeal);
        
            if (!contact_service_response.data)
                return contact_service_response as Service_Response<null>;
        
            return {
                code: STATUS_CODES.OK,
                message: `Appeal ${appeal_id} accepted`,
            }
        
        }
        else {
        
            await appealRef.update({
                status: APPEAL_STATUS.REJECTED,
                status_changed: Timestamp.now(),
                message: "Your appeal to connect with " + appeal.receiver + " has been rejected",
            });
        
            return {
                code: STATUS_CODES.OK,
                message: `Appeal ${appeal_id} rejected`,
            }
        }
    }
    else {
        const communityRef = AdminApp.CommunityCollection.doc(appeal.receiver as string);
        const community = castToCommunityPrivate(await communityRef.get());
        
        const auth_service_response = await checkModerationAccessWithToken(community, token);
        if (!auth_service_response.data) return auth_service_response as Service_Response<null>;
        
        const senderRef = await AdminApp.UserCollection.doc(appeal.sender as string);
        
        if (appeal.type == APPEAL_TYPE.JOIN) {

            if (decision == APPEAL_STATUS.ACCEPTED) {

                await appealRef.update({
                    status: APPEAL_STATUS.ACCEPTED,
                    status_changed: Timestamp.now(),
                    message: "Your appeal to join " + community.name + " has been accepted",
                });
        
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

                return {
                    code: STATUS_CODES.OK,
                    message: `Appeal ${appeal_id} accepted`,
                }
            }
            else {

                await appealRef.update({
                    status: APPEAL_STATUS.REJECTED,
                    status_changed: Timestamp.now(),
                    message: "Your appeal to join " + community.name + " has been rejected",
                });
        
                return {
                    code: STATUS_CODES.OK,
                    message: `Appeal ${appeal_id} rejected`,
                }
            }
        }
        else if (appeal.type == APPEAL_TYPE.MODERATE) {
           
            if (decision == APPEAL_STATUS.ACCEPTED) {

                await appealRef.update({
                    status: APPEAL_STATUS.ACCEPTED,
                    status_changed: Timestamp.now(),
                    message: "Your appeal to moderate " + community.name + " has been accepted",
                });

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

                return {
                    code: STATUS_CODES.OK,
                    message: `Appeal ${appeal_id} accepted`,
                }
            }
            else {
            
                await appealRef.update({
                    status: APPEAL_STATUS.REJECTED,
                    status_changed: Timestamp.now(),
                    message: "Your appeal to moderate " + community.name + " has been rejected",
                });
            
                return {
                    code: STATUS_CODES.OK,
                    message: `Appeal ${appeal_id} rejected`,
                }
            }
        }
        else {
            const role_service_response = await getMemberRole(community, senderRef.id);
            if (!role_service_response.data) return role_service_response as Service_Response<null>;
            
            if (decision == APPEAL_STATUS.ACCEPTED) {
            
                await appealRef.update({
                    status: APPEAL_STATUS.ACCEPTED,
                    status_changed: Timestamp.now(),
                    message: "Your appeal to announce in " + community.name + " has been accepted",
                });

                await communityRef.update({
                    announcements: FieldValue.arrayUnion({
                        content: appeal.message,
                        user: senderRef,
                        time: Timestamp.now(),
                    } as Announcement_Document)
                });

                return {
                    code: STATUS_CODES.OK,
                    message: `Appeal ${appeal_id} accepted`,
                }
            }
            else {
            
                await appealRef.update({
                    status: APPEAL_STATUS.REJECTED,
                    status_changed: Timestamp.now(),
                    message: "Your appeal to announce in " + community.name + " has been rejected",
                });
            
                return {
                    code: STATUS_CODES.OK,
                    message: `Appeal ${appeal_id} rejected`,
                }
            }
        }
    }
}

