import { Clock, RefreshCw } from "lucide-react";

import SeverityBadge from "./SeverityBadge";
import "./AlertTable.css";

function AlertTable({ alerts = [], isAdmin = false, updatingId, onStatusChange, formatTime }) {
	return (
		<div className="alert-table-wrapper">
			<table className="alert-table">
				<thead><tr><th>TIME</th><th>ALERT</th><th>SOURCE IP</th><th>PROTOCOL</th><th>SEVERITY</th><th>STATUS</th>{isAdmin && <th>ACTION</th>}</tr></thead>
				<tbody>
					{alerts.map((alert) => (
						<tr key={alert.id}>
							<td><span className="alert-table-time"><Clock size={13} />{formatTime ? formatTime(alert.createdAt) : "Just now"}</span></td>
							<td><div className="alert-table-name"><strong>{alert.eventType || "SECURITY ALERT"}</strong><span>{alert.description || "Suspicious activity detected."}</span></div></td>
							<td className="alert-table-ip">{alert.sourceIp || "Unknown"}</td>
							<td><span className="alert-table-protocol">{alert.protocol || "Unknown"}</span></td>
							<td><SeverityBadge severity={alert.severity} /></td>
							<td><span className={`alert-table-status ${String(alert.status || "OPEN").toLowerCase()}`}>{alert.status || "OPEN"}</span></td>
							{isAdmin && <td>{updatingId === alert.id ? <RefreshCw size={15} className="alert-table-spinner" /> : <button className="alert-table-action" onClick={() => onStatusChange?.(alert.id, alert.status === "OPEN" ? "INVESTIGATING" : "RESOLVED")}>{alert.status === "OPEN" ? "Investigate" : "Resolve"}</button>}</td>}
						</tr>
					))}
				</tbody>
			</table>
			{!alerts.length && <div className="alert-table-empty">No alerts match the current filters.</div>}
		</div>
	);
}

export default AlertTable;
