// Import the functions you need from the SDKs you need
import { App, initializeApp } from "firebase-admin/app";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import adminConfig from "@/server/firebase/admin.config.json";

var adminFirebaseApp: App = {} as ReturnType<typeof initializeApp>;

if (admin.apps.length == 0) {
    adminFirebaseApp = initializeApp(
        {
            credential: admin.credential.cert({
                projectId: adminConfig.project_id,
                clientEmail: adminConfig.client_email,
                privateKey: adminConfig.private_key,
            }),
        },
        "adminApp"
    );
    console.log("Firebase Admin Initialized", adminFirebaseApp.name);
} else {
    adminFirebaseApp = admin.apps[0] as App;
}

const adminAuth = getAuth(adminFirebaseApp);
const adminDb = getFirestore(adminFirebaseApp);
const UserCollection = adminDb.collection("Users");
const CommunityCollection = adminDb.collection("Communities");
const AppealCollection = adminDb.collection("Appeals");
const MessageCollection = adminDb.collection("Messages");
const ContactCollection = adminDb.collection("Contacts");
const AnnouncementCollection = adminDb.collection("Announcements");
const AdminApp = {
    adminAuth,
    UserCollection,
    CommunityCollection,
    AppealCollection,
    MessageCollection,
    ContactCollection,
    AnnouncementCollection,
};

export default AdminApp;