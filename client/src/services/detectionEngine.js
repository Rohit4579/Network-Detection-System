import { detectPortScan } from "../detection/portScanDetector";
import { classifyThreat } from "../detection/threatDetector";
import { inspectTraffic } from "../detection/trafficDetector";
import { createSecurityEvent } from "./securityEvents";

export async function processTrafficPacket(packet, userId, rules = []) {
    const inspectedTraffic = inspectTraffic(packet);

    if (!inspectedTraffic) {
        return { success: false, error: new Error("Invalid traffic packet") };
    }

    const detectedPortScan = detectPortScan(packet.attempts, packet.portScanThreshold);
    const threat = classifyThreat(detectedPortScan || inspectedTraffic, rules);

    if (!threat) {
        return { success: false, error: new Error("No threat detected") };
    }

    return createSecurityEvent({
        ...threat,
        createdBy: userId,
    });
}
