import {
    Activity,
    BarChart3,
    LayoutDashboard,
    Server,
    Settings,
    Shield,
    ShieldAlert,
    Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import "./AppLayout.css";

const navigation = [
    {
        section: "MONITORING",
        links: [
            ["/dashboard", "Dashboard", LayoutDashboard],
            ["/events", "Live Events", Activity],
            ["/alerts", "Alerts", ShieldAlert],
        ],
    },
    {
        section: "ANALYSIS",
        links: [["/analytics", "Analytics", BarChart3]],
    },
];

function Sidebar({ open, onClose }) {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    const sections = isAdmin
        ? [
              ...navigation,
              {
                  section: "ADMINISTRATION",
                  links: [
                      ["/rules", "Detection Rules", Settings],
                      ["/users", "Users", Users],
                      ["/settings", "Settings", Settings],
                  ],
              },
          ]
        : navigation;

    return (
        <aside className={`sidebar ${open ? "sidebar-open" : "sidebar-closed"}`}>
            <div className="sidebar-header">
                <div className="brand-icon"><Shield size={21} /></div>
                <div className="brand-text">
                    <strong>Network Sentinel</strong>
                    <span>Intrusion Detection</span>
                </div>
            </div>

            <nav className="sidebar-nav" aria-label="Primary navigation">
                {sections.map((section) => (
                    <div key={section.section}>
                        <div className="nav-section-title">{section.section}</div>
                        {section.links.map(([path, label, Icon]) => (
                            <SidebarLink key={path} to={path} label={label} icon={<Icon size={18} />} onNavigate={onClose} />
                        ))}
                    </div>
                ))}
                <div className="nav-section-title">SECURITY</div>
                <SidebarLink to="/logs" label="Security Logs" icon={<Server size={18} />} onNavigate={onClose} />
            </nav>

            <div className="sidebar-status">
                <div className="sidebar-status-header"><span className="status-indicator" /><span>Detection Engine</span></div>
                <strong>Operational</strong>
                <small>All detection rules active</small>
            </div>

            <div className="sidebar-user">
                <div className="user-avatar">{user?.email?.charAt(0)?.toUpperCase() || "A"}</div>
                <div className="user-info">
                    <strong>{user?.name || "Security Analyst"}</strong>
                    <span>{user?.email || "Analyst"}</span>
                </div>
            </div>
        </aside>
    );
}

function SidebarLink({ to, icon, label, onNavigate }) {
    const location = useLocation();
    const active = location.pathname === to;

    return (
        <Link to={to} className={`sidebar-link ${active ? "active" : ""}`} onClick={onNavigate}>
            {icon}
            <span>{label}</span>
        </Link>
    );
}

export default Sidebar;
