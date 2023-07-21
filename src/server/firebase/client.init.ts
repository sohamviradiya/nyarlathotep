import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import clientConfig from "./client.config.json";
import { FirebaseApp,getApps,getApp } from "firebase/app";
var clientApp: FirebaseApp = {} as FirebaseApp;
if (getApps().length > 0) {
	clientApp = getApps()[0];
} else {
	clientApp = initializeApp(clientConfig);
}

console.log("Firebase Client Initialized", clientApp.name);
export const clientAuth = getAuth(clientApp);
export const clientDb = getFirestore(clientApp);
