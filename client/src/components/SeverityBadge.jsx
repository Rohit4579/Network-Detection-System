import "./SeverityBadge.css";

function SeverityBadge({ severity = "LOW" }) {
	const normalizedSeverity = String(severity).toLowerCase();

	return (
		<span className={`severity-badge ${normalizedSeverity}`}>
			{String(severity).toUpperCase()}
		</span>
	);
}

export default SeverityBadge;
