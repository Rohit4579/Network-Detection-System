import { AlertTriangle, Bell, Check, ChevronDown, LogOut, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import "./AppLayout.css";

const titles = {
    "/dashboard": "Security Dashboard",
    "/events": "Live Events",
    "/alerts": "Security Alerts",
    "/analytics": "Security Analytics",
    "/logs": "Security Logs",
    "/rules": "Detection Rules",
    "/users": "User Management",
    "/settings": "System Settings",
};

function Navbar({ sidebarOpen, onToggleSidebar, notifications = [], onDeleteNotification, deletingNotificationId }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const title = titles[location.pathname] || "Security Dashboard";

    const handleLogout = async () => {
        await logout();
        setShowProfile(false);
    };

    return (
        <header className="topbar">
            <div className="topbar-left">
                <button className="menu-button" onClick={onToggleSidebar} aria-label="Toggle navigation">
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <div className="page-heading">
                    <h1>{title}</h1>
                    <span>Security Operations Center</span>
                </div>
            </div>

            <div className="topbar-actions">
                <label className="global-search"><Search size={17} /><input aria-label="Search events" placeholder="Search events..." /></label>
                <div className="action-wrapper">
                    <button className="topbar-icon-button" onClick={() => setShowNotifications((value) => !value)} aria-label="Notifications" aria-expanded={showNotifications}>
                        <Bell size={19} />
                        {notifications.length > 0 && <span className="notification-dot" />}
                    </button>
                    {showNotifications && <div className="dropdown notification-dropdown">
                        <div className="dropdown-header">Notifications</div>
                        {notifications.length > 0 ? notifications.map((notification) => (
                            <div className="notification-item" key={notification.id}>
                                <AlertTriangle size={16} />
                                <div><strong>{notification.eventType || "Security event detected"}</strong><span>{notification.sourceIp || "Unknown source"}</span></div>
                                {onDeleteNotification && <button className="notification-dismiss" onClick={() => onDeleteNotification(notification.id)} disabled={deletingNotificationId === notification.id} aria-label={`Delete ${notification.eventType || "notification"}`}>
                                    {deletingNotificationId === notification.id ? <Check size={14} /> : <X size={14} />}
                                </button>}
                            </div>
                        )) : <div className="notification-empty">No active security notifications.</div>}
                    </div>}
                </div>

                <div className="profile-wrapper">
                    <button className="profile-button" onClick={() => setShowProfile((value) => !value)} aria-expanded={showProfile}>
                        <div className="profile-avatar">{user?.email?.charAt(0)?.toUpperCase() || "A"}</div>
                        <div className="profile-text"><strong>{user?.name || "Security Analyst"}</strong><span>{user?.role === "admin" ? "Administrator" : "Analyst"}</span></div>
                        <ChevronDown size={16} />
                    </button>
                    {showProfile && <div className="dropdown profile-dropdown">
                        <div className="dropdown-user"><strong>{user?.name || "Security Analyst"}</strong><span>{user?.email}</span><small>{user?.role === "admin" ? "Administrator" : "Security Analyst"}</small></div>
                        <button className="logout-button" onClick={handleLogout}><LogOut size={16} />Sign Out</button>
                    </div>}
                </div>
            </div>
        </header>
    );
}

export default Navbar;
