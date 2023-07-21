import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import clientConfig from "@/server/firebase/client.config.json";
import { FirebaseApp,getApps } from "firebase/app";


export default (() => {
    var clientApp: FirebaseApp = {} as FirebaseApp;
    if (getApps().length > 0) {
        clientApp = getApps()[0];
    } else {
        clientApp = initializeApp(clientConfig);
    }
console.log("Firebase Client Initialized", clientApp.name);
        const clientAuth = getAuth(clientApp);
    const clientDb = getFirestore(clientApp);
    return {
        clientApp,
        clientAuth,
        clientDb,
    }
})();


