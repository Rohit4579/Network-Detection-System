import {
    addDoc,
    collection,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

const logsRef = collection(db, "securityLogs");

export async function createSecurityLog({
    userId,
    action,
    description,
    targetId = "",
}) {
    try {
        if (!userId || !action || !description) {
            throw new Error("userId, action and description are required");
        }

        const documentReference = await addDoc(logsRef, {
            userId,
            action,
            description,
            targetId,
            createdAt: serverTimestamp(),
        });

        return { success: true, id: documentReference.id };
    } catch (error) {
        console.error("Failed to create security log:", error);
        return { success: false, error };
    }
}

export function subscribeToSecurityLogs(onData, onError) {
    const logsQuery = query(logsRef, orderBy("createdAt", "desc"), limit(100));

    return onSnapshot(
        logsQuery,
        (snapshot) => onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        (error) => {
            console.error("Security logs listener error:", error);
            onError?.(error);
        }
    );
}
