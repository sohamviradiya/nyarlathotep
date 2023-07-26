// Import the functions you need from the SDKs you need
import { App, initializeApp } from "firebase-admin/app";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import adminConfig from "@/server/firebase/admin.config.json";

var adminApp: App = {} as ReturnType<typeof initializeApp>;

if (admin.apps.length == 0) {
    adminApp = initializeApp(
        {
            credential: admin.credential.cert({
                projectId: adminConfig.project_id,
                clientEmail: adminConfig.client_email,
                privateKey: adminConfig.private_key,
            }),
        },
        "adminApp"
    );
    console.log("Firebase Admin Initialized", adminApp.name);
} else {
    adminApp = admin.apps[0] as App;
}

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);
const UserCollection = adminDb.collection("Users");
const CommunityCollection = adminDb.collection("Communities");
const AppealCollection = adminDb.collection("Appeals");
const MessageCollection = adminDb.collection("Messages");
const ContactCollection = adminDb.collection("Contacts");
const AnnouncementCollection = adminDb.collection("Announcements");
export default {
    adminAuth,
    UserCollection,
    CommunityCollection,
    AppealCollection,
    MessageCollection,
    ContactCollection,
    AnnouncementCollection,
} as const;