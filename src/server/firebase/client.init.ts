import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import clientConfig from "@/server/firebase/client.config.json";
import { FirebaseApp, getApps } from "firebase/app";

var clientApp: FirebaseApp = {} as ReturnType<typeof initializeApp>;

if (getApps().length > 0) {
    clientApp = getApps()[0];
} else {
    clientApp = initializeApp(clientConfig);
    console.log("Firebase Client Initialized", clientApp.name);
}
const clientAuth = getAuth(clientApp);
const clientDb = getFirestore(clientApp);

export {
    clientAuth,
    clientDb,
};


