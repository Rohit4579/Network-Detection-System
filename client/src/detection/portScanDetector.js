export function detectPortScan(attempts, threshold = 10) {
	if (!Array.isArray(attempts) || attempts.length < threshold) {
		return null;
	}

	const firstAttempt = attempts[0];
	const sourceIp = firstAttempt?.sourceIp;

	if (!sourceIp || attempts.some((attempt) => attempt.sourceIp !== sourceIp)) {
		return null;
	}

	const ports = [...new Set(attempts.map((attempt) => attempt.destinationPort).filter(Boolean))];

	return {
		sourceIp,
		destinationIp: firstAttempt.destinationIp || "Unknown",
		eventType: "PORT_SCAN",
		protocol: firstAttempt.protocol || "TCP",
		severity: ports.length >= threshold * 2 ? "CRITICAL" : "HIGH",
		status: "OPEN",
		description: `Repeated connection attempts across ${ports.length || attempts.length} ports detected.`,
	};
}

export default detectPortScan;
