const severityRank = {
	LOW: 1,
	MEDIUM: 2,
	HIGH: 3,
	CRITICAL: 4,
};

export function classifyThreat(event, rules = []) {
	if (!event) {
		return null;
	}

	const matchingRule = rules.find(
		(rule) => rule.enabled !== false && rule.eventType === event.eventType
	);

	const ruleSeverity = matchingRule?.severity || event.severity || "LOW";
	const eventSeverity = event.severity || "LOW";
	const severity = severityRank[ruleSeverity] > severityRank[eventSeverity]
		? ruleSeverity
		: eventSeverity;

	return {
		...event,
		severity,
		status: event.status || "OPEN",
		source: event.source || "Detection Engine",
	};
}

export default classifyThreat;
