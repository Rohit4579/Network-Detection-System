import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD6NwSwhgEDQvNQDg2_51dKz4X5Jm3KaXc",
    authDomain: "network-detection-system-cda4a.firebaseapp.com",
    projectId: "network-detection-system-cda4a",
    storageBucket: "network-detection-system-cda4a.firebasestorage.app",
    messagingSenderId: "848397218371",
    appId: "1:848397218371:web:acd20c591dd14cbab45af6",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);