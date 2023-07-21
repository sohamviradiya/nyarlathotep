// Import the functions you need from the SDKs you need
import { App, initializeApp } from "firebase-admin/app";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import adminConfig from "@/server/firebase/admin.config.json";
var adminApp: App = {} as App;

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
} else {
	adminApp = admin.apps[0] as App;
}

console.log("Firebase Admin Initialized", adminApp.name);
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
