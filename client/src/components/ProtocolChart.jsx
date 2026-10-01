import "./ProtocolChart.css";

const defaultData = [
	{ label: "TCP", value: 68, color: "blue" },
	{ label: "HTTP", value: 48, color: "orange" },
	{ label: "UDP", value: 31, color: "green" },
];

function ProtocolChart({ data = defaultData }) {
	const maximum = Math.max(...data.map((item) => item.value), 1);

	return (
		<div className="protocol-chart">
			{data.map((item) => (
				<div className="protocol-row" key={item.label}>
					<div className="protocol-row-label"><span className={`protocol-dot ${item.color}`} />{item.label}<strong>{item.value}</strong></div>
					<div className="protocol-track"><span className={`protocol-fill ${item.color}`} style={{ width: `${(item.value / maximum) * 100}%` }} /></div>
				</div>
			))}
		</div>
	);
}

export default ProtocolChart;
