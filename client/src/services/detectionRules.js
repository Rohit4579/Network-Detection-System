import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";

const rulesRef = collection(db, "detectionRules");

export function subscribeToDetectionRules(onData, onError) {
    const rulesQuery = query(rulesRef, orderBy("createdAt", "desc"), limit(100));

    return onSnapshot(
        rulesQuery,
        (snapshot) => onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        (error) => {
            console.error("Detection rules listener error:", error);
            onError?.(error);
        }
    );
}

export async function createDetectionRule(rule, userId) {
    try {
        const documentReference = await addDoc(rulesRef, {
            ...rule,
            createdBy: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return { success: true, id: documentReference.id };
    } catch (error) {
        console.error("Failed to create detection rule:", error);
        return { success: false, error };
    }
}

export async function updateDetectionRule(ruleId, changes) {
    try {
        await updateDoc(doc(db, "detectionRules", ruleId), {
            ...changes,
            updatedAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to update detection rule:", error);
        return { success: false, error };
    }
}

export async function deleteDetectionRule(ruleId) {
    try {
        await deleteDoc(doc(db, "detectionRules", ruleId));
        return { success: true };
    } catch (error) {
        console.error("Failed to delete detection rule:", error);
        return { success: false, error };
    }
}
