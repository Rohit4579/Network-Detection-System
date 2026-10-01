import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "./firebase";

const settingsReference = doc(db, "systemSettings", "default");

export async function getSystemSettings() {
    try {
        const snapshot = await getDoc(settingsReference);
        return { success: true, data: snapshot.exists() ? snapshot.data() : {} };
    } catch (error) {
        console.error("Failed to load system settings:", error);
        return { success: false, error, data: {} };
    }
}

export async function saveSystemSettings(settings, userId) {
    try {
        await setDoc(settingsReference, {
            ...settings,
            updatedBy: userId,
            updatedAt: serverTimestamp(),
        }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("Failed to save system settings:", error);
        return { success: false, error };
    }
}
