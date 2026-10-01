import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    Check,
    ChevronDown,
    Clock3,
    Filter,
    LockKeyhole,
    Plus,
    Save,
    Search,
    ShieldCheck,
    Trash2,
} from "lucide-react";
import { useLocation } from "react-router-dom";

import ProtocolChart from "../../components/ProtocolChart";
import TrafficChart from "../../components/TrafficChart";
import { useAuth } from "../../context/AuthContext";
import { subscribeToSecurityEvents } from "../../services/securityEvents";
import { subscribeToSecurityLogs } from "../../services/securityLogs";
import {
    createDetectionRule,
    deleteDetectionRule,
    subscribeToDetectionRules,
    updateDetectionRule,
} from "../../services/detectionRules";
import { getSystemSettings, saveSystemSettings } from "../../services/systemSettings";

import "./Operations.css";

const pageConfig = {
    "/analytics": {
        eyebrow: "ANALYSIS",
        title: "Security Analytics",
        description: "Understand network activity and threat patterns over time.",
    },
    "/logs": {
        eyebrow: "SECURITY",
        title: "Security Logs",
        description: "Review system activity and detection engine decisions.",
    },
    "/rules": {
        eyebrow: "ADMINISTRATION",
        title: "Detection Rules",
        description: "Control which network behaviors create security events.",
    },
    "/settings": {
        eyebrow: "ADMINISTRATION",
        title: "System Settings",
        description: "Manage monitoring preferences and account protection.",
    },
};

function formatTimestamp(timestamp) {
    if (!timestamp) return "Just now";
    try {
        return timestamp.toDate().toLocaleString();
    } catch {
        return "Unknown time";
    }
}

function countValues(items, field) {
    const counts = items.reduce((result, item) => {
        const value = item[field] || "Unknown";
        result[value] = (result[value] || 0) + 1;
        return result;
    }, {});

    return Object.entries(counts).map(([label, value], index) => ({
        label,
        value,
        color: ["blue", "orange", "green", "red"][index % 4],
    }));
}

function Operations() {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const config = pageConfig[pathname] || pageConfig["/analytics"];
    const [search, setSearch] = useState("");
    const [logFilter, setLogFilter] = useState("all");
    const [events, setEvents] = useState([]);
    const [logs, setLogs] = useState([]);
    const [rules, setRules] = useState([]);
    const [settings, setSettings] = useState({ notifications: true, retention: true, mfa: false });
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showRuleForm, setShowRuleForm] = useState(false);
    const [newRule, setNewRule] = useState({ name: "", description: "", eventType: "PORT_SCAN", severity: "HIGH", enabled: true });

    useEffect(() => {
        if (pathname === "/analytics") {
            return subscribeToSecurityEvents(
                (data) => {
                    setEvents(data);
                    setLoading(false);
                },
                () => {
                    setError("Unable to load analytics events.");
                    setLoading(false);
                }
            );
        }

        if (pathname === "/logs") {
            return subscribeToSecurityLogs(
                (data) => {
                    setLogs(data.map((log) => ({
                        ...log,
                        time: formatTimestamp(log.createdAt),
                        type: log.action || "System",
                        message: log.description || "Security activity recorded.",
                        level: log.action?.includes("ALERT") ? "warning" : "info",
                    })));
                    setLoading(false);
                },
                () => {
                    setError("Unable to load security logs.");
                    setLoading(false);
                }
            );
        }

        if (pathname === "/rules") {
            return subscribeToDetectionRules(
                (data) => {
                    setRules(data);
                    setLoading(false);
                },
                () => {
                    setError("Unable to load detection rules.");
                    setLoading(false);
                }
            );
        }

        if (pathname === "/settings") {
            let active = true;
            getSystemSettings().then((result) => {
                if (!active) return;
                if (!result.success) setError("Unable to load system settings.");
                setSettings((current) => ({ ...current, ...result.data }));
                setLoading(false);
            });
            return () => { active = false; };
        }

        return undefined;
    }, [pathname]);

    const analyticsData = useMemo(() => [
        { label: "Total events", value: events.length, tone: "blue" },
        { label: "Critical events", value: events.filter((event) => event.severity === "CRITICAL").length, tone: "red" },
        { label: "High severity", value: events.filter((event) => event.severity === "HIGH").length, tone: "orange" },
        { label: "Open events", value: events.filter((event) => event.status === "OPEN").length, tone: "green" },
    ], [events]);

    const protocolData = useMemo(() => countValues(events, "protocol"), [events]);
    const trafficData = useMemo(() => events.slice(0, 12).reverse().map((event) => event.severity === "CRITICAL" ? 100 : event.severity === "HIGH" ? 75 : 45), [events]);

    const filteredLogs = useMemo(() => {
        const query = search.trim().toLowerCase();
        return logs.filter((row) => {
            const matchesQuery = !query || `${row.type} ${row.message}`.toLowerCase().includes(query);
            const matchesLevel = logFilter === "all" || row.level === logFilter;
            return matchesQuery && matchesLevel;
        });
    }, [logs, search, logFilter]);

    const toggleRule = async (rule) => {
        const result = await updateDetectionRule(rule.id, { enabled: !rule.enabled });
        if (!result.success) {
            setError("Unable to update detection rule.");
        }
    };

    const toggleSetting = (setting) => {
        setSettings((current) => ({ ...current, [setting]: !current[setting] }));
        setSaved(false);
    };

    const saveSettings = () => {
        saveSystemSettings(settings, user.uid).then((result) => {
            if (!result.success) {
                setError("Unable to save system settings.");
                return;
            }
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2200);
        });
    };

    const removeRule = async (ruleId) => {
        const result = await deleteDetectionRule(ruleId);
        if (!result.success) setError("Unable to delete detection rule.");
    };

    const addRule = async (event) => {
        event.preventDefault();
        if (!newRule.name.trim() || !newRule.description.trim() || !user?.uid) return;

        const result = await createDetectionRule(newRule, user.uid);
        if (!result.success) {
            setError("Unable to create detection rule.");
            return;
        }

        setNewRule({ name: "", description: "", eventType: "PORT_SCAN", severity: "HIGH", enabled: true });
        setShowRuleForm(false);
    };

    return (
        <div className="operations-page">
            <header className="operations-header">
                <div>
                    <div className="operations-eyebrow"><span />{config.eyebrow}</div>
                    <h2>{config.title}</h2>
                    <p>{config.description}</p>
                </div>
                {pathname === "/settings" && (
                    <button className="operations-primary-button" onClick={saveSettings}>
                        {saved ? <Check size={16} /> : <Save size={16} />}
                        {saved ? "Saved" : "Save changes"}
                    </button>
                )}
            </header>

            {error && <div className="operations-error">{error}</div>}

            {loading && <div className="operations-loading">Loading {config.title.toLowerCase()}...</div>}

            {!loading && pathname === "/analytics" && (
                <>
                    <div className="operations-stat-grid">
                        {analyticsData.map((item) => (
                            <article className="operations-stat-card" key={item.label}>
                                <div className={`operations-stat-icon ${item.tone}`}><Activity size={18} /></div>
                                <span>{item.label}</span>
                                <strong>{item.value}</strong>
                                <small>{item.change} from last period</small>
                            </article>
                        ))}
                    </div>
                    <div className="operations-analytics-grid">
                        <section className="operations-panel analytics-panel">
                            <div className="operations-panel-heading"><div><h3>Detection volume</h3><p>Events recorded during the current monitoring window</p></div><Clock3 size={18} /></div>
                            <TrafficChart data={trafficData.length ? trafficData : [0]} />
                        </section>
                        <section className="operations-panel analytics-panel">
                            <div className="operations-panel-heading"><div><h3>Protocol distribution</h3><p>Traffic observed by protocol</p></div><Activity size={18} /></div>
                            <ProtocolChart data={protocolData.length ? protocolData : [{ label: "No data", value: 0, color: "blue" }]} />
                        </section>
                    </div>
                </>
            )}

            {!loading && pathname === "/logs" && (
                <section className="operations-panel">
                    <div className="operations-toolbar">
                        <label className="operations-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search logs..." /></label>
                        <label className="operations-select"><Filter size={15} /><select value={logFilter} onChange={(event) => setLogFilter(event.target.value)}><option value="all">All levels</option><option value="warning">Warnings</option><option value="info">Information</option><option value="success">Success</option></select><ChevronDown size={14} /></label>
                    </div>
                    <div className="operations-log-list">{filteredLogs.map((row) => <div className="operations-log-row" key={`${row.time}-${row.message}`}><span className="operations-log-time">{row.time}</span><span className={`operations-log-level ${row.level}`}>{row.type}</span><p>{row.message}</p></div>)}{filteredLogs.length === 0 && <div className="operations-empty">No logs match the current filters.</div>}</div>
                </section>
            )}

            {!loading && pathname === "/rules" && (
                <section className="operations-panel">
                    <div className="operations-panel-heading"><div><h3>Active detection rules</h3><p>Changes apply to newly evaluated traffic.</p></div><button className="operations-secondary-button" onClick={() => setShowRuleForm((value) => !value)}><Plus size={15} />{showRuleForm ? "Close" : "New rule"}</button></div>
                    {showRuleForm && <form className="rule-form" onSubmit={addRule}>
                        <input value={newRule.name} onChange={(event) => setNewRule((current) => ({ ...current, name: event.target.value }))} placeholder="Rule name" required />
                        <input value={newRule.description} onChange={(event) => setNewRule((current) => ({ ...current, description: event.target.value }))} placeholder="Description" required />
                        <select value={newRule.eventType} onChange={(event) => setNewRule((current) => ({ ...current, eventType: event.target.value }))}><option value="PORT_SCAN">PORT_SCAN</option><option value="SUSPICIOUS_TRAFFIC">SUSPICIOUS_TRAFFIC</option><option value="BRUTE_FORCE">BRUTE_FORCE</option></select>
                        <select value={newRule.severity} onChange={(event) => setNewRule((current) => ({ ...current, severity: event.target.value }))}><option value="CRITICAL">CRITICAL</option><option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option></select>
                        <button className="operations-primary-button" type="submit">Create rule</button>
                    </form>}
                    <div className="rule-list">{rules.map((rule) => <div className="rule-row" key={rule.id}><div className="rule-icon"><ShieldCheck size={18} /></div><div className="rule-copy"><strong>{rule.name}</strong><span>{rule.description || rule.detail || "Detection rule"}</span></div><span className={`rule-severity ${(rule.severity || "medium").toLowerCase()}`}>{rule.severity || "MEDIUM"}</span><button className={`switch ${rule.enabled ? "on" : ""}`} onClick={() => toggleRule(rule)} aria-label={`${rule.enabled ? "Disable" : "Enable"} ${rule.name}`}><span /></button><button className="rule-delete" onClick={() => removeRule(rule.id)} aria-label={`Delete ${rule.name}`}><Trash2 size={15} /></button></div>)}</div>
                </section>
            )}

            {!loading && pathname === "/settings" && (
                <section className="operations-panel settings-panel">
                    <div className="settings-group"><div className="settings-group-heading"><LockKeyhole size={18} /><div><h3>Security preferences</h3><p>Choose how the monitoring center communicates with you.</p></div></div><SettingRow label="Threat notifications" detail="Receive alerts for high and critical events." value={settings.notifications} onChange={() => toggleSetting("notifications")} /><SettingRow label="Daily activity summary" detail="Send a daily digest of detection activity." value={settings.retention} onChange={() => toggleSetting("retention")} /><SettingRow label="Require multi-factor authentication" detail="Protect administrator accounts with an additional sign-in step." value={settings.mfa} onChange={() => toggleSetting("mfa")} /></div>
                </section>
            )}
        </div>
    );
}

function SettingRow({ label, detail, value, onChange }) {
    return <div className="setting-row"><div><strong>{label}</strong><span>{detail}</span></div><button className={`switch ${value ? "on" : ""}`} onClick={onChange} aria-label={`${value ? "Disable" : "Enable"} ${label}`}><span /></button></div>;
}

export default Operations;
