import "./TrafficChart.css";

const defaultData = [35, 48, 42, 65, 52, 78, 61, 72, 45, 85, 69, 92];

function TrafficChart({ data = defaultData, labels, height = 220 }) {
	const chartLabels = labels || data.map((_, index) => `${index + 1}h`);
	const maximum = Math.max(...data, 1);

	return (
		<div className="traffic-chart" style={{ "--traffic-chart-height": `${height}px` }}>
			{data.map((value, index) => (
				<div className="traffic-chart-column" key={`${chartLabels[index]}-${index}`}>
					<div className="traffic-chart-bar" style={{ height: `${(value / maximum) * 100}%` }} />
					<span>{chartLabels[index]}</span>
				</div>
			))}
		</div>
	);
}

export default TrafficChart;
