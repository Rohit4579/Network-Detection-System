const suspiciousProtocols = new Set(["TELNET", "FTP", "RDP"]);

export function inspectTraffic(packet) {
	if (!packet || typeof packet !== "object") {
		return null;
	}

	const sourceIp = String(packet.sourceIp || "").trim();
	const destinationIp = String(packet.destinationIp || "").trim();
	const protocol = String(packet.protocol || "UNKNOWN").toUpperCase();
	const bytes = Number(packet.bytes || 0);

	if (!sourceIp || !destinationIp) {
		return null;
	}

	return {
		...packet,
		sourceIp,
		destinationIp,
		protocol,
		eventType: suspiciousProtocols.has(protocol) ? "SUSPICIOUS_TRAFFIC" : packet.eventType,
		severity: bytes > 10000000 ? "HIGH" : packet.severity || "LOW",
	};
}

export default inspectTraffic;
