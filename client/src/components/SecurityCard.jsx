import "./SecurityCard.css";

function SecurityCard({
	title,
	value,
	subtitle,
	icon,
	type = "blue",
}) {
	return (
		<article className={`security-card ${type}`}>
			<div className="security-card-icon">{icon}</div>
			<div className="security-card-content">
				<span>{title}</span>
				<strong>{value}</strong>
				<small>{subtitle}</small>
			</div>
		</article>
	);
}

export default SecurityCard;
