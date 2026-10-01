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
import { createSecurityLog } from "./securityLogs";

const securityEventsRef = collection(
    db,
    "securityEvents"
);

// Create a new security event
export async function createSecurityEvent(event) {
    try {
        if (!event.createdBy) {
            throw new Error("createdBy is required");
        }

        const eventData = {
            sourceIp: event.sourceIp || "Unknown",
            destinationIp: event.destinationIp || "Unknown",

            eventType:
                event.eventType || "UNKNOWN",

            protocol:
                event.protocol || "Unknown",

            severity:
                event.severity || "LOW",

            status:
                event.status || "OPEN",

            source:
                event.source || "Detection Engine",

            description:
                event.description || "",

            createdBy: event.createdBy,

            detectedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const documentReference = await addDoc(
            securityEventsRef,
            eventData
        );

        console.log(
            "Security event created:",
            documentReference.id
        );

        await createSecurityLog({
            userId: event.createdBy,
            action: "EVENT_CREATED",
            description: "Security event created",
            targetId: documentReference.id,
        });

        return {
            success: true,
            id: documentReference.id,
        };
    } catch (error) {
        console.error(
            "Failed to create security event:",
            error
        );

        return {
            success: false,
            error,
        };
    }
}


// Listen to security events in real time
export function subscribeToSecurityEvents(
    onData,
    onError
) {
    try {
        const eventsQuery = query(
            securityEventsRef,
            orderBy("createdAt", "desc"),
            limit(100)
        );

        const unsubscribe = onSnapshot(
            eventsQuery,
            (snapshot) => {
                const events =
                    snapshot.docs.map(
                        (documentSnapshot) => ({
                            id:
                                documentSnapshot.id,

                            ...documentSnapshot.data(),
                        })
                    );

                onData(events);
            },
            (error) => {
                console.error(
                    "Security events listener error:",
                    error
                );

                if (onError) {
                    onError(error);
                }
            }
        );

        return unsubscribe;

    } catch (error) {
        console.error(
            "Failed to subscribe to security events:",
            error
        );

        if (onError) {
            onError(error);
        }

        return () => {};
    }
}


// Update event status
export async function updateSecurityEventStatus(
    eventId,
    status,
    userId
) {
    try {
        if (!eventId) {
            throw new Error("eventId is required");
        }

        if (!status) {
            throw new Error("status is required");
        }

        const eventReference = doc(
            db,
            "securityEvents",
            eventId
        );

        await updateDoc(
            eventReference,
            {
                status,
                updatedAt:
                    serverTimestamp(),
            }
        );

        console.log(
            "Security event status updated:",
            eventId,
            status
        );

        if (userId && ["INVESTIGATING", "RESOLVED"].includes(status)) {
            await createSecurityLog({
            userId,
                action: status === "RESOLVED"
                    ? "ALERT_RESOLVED"
                    : "ALERT_INVESTIGATING",
                description: status === "RESOLVED"
                    ? "Security event resolved"
                    : "Security alert moved to investigation",
                targetId: eventId,
            });
        }

        return {
            success: true,
        };

    } catch (error) {
        console.error(
            "Failed to update security event:",
            error
        );

        return {
            success: false,
            error,
        };
    }
}

export async function deleteSecurityEvent(eventId) {
    try {
        if (!eventId) {
            throw new Error("eventId is required");
        }

        await deleteDoc(doc(db, "securityEvents", eventId));

        return { success: true };
    } catch (error) {
        console.error("Failed to delete security event:", error);

        return {
            success: false,
            error,
        };
    }
}