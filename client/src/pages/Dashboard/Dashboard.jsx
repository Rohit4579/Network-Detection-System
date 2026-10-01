import { useEffect, useState } from "react";

import {
    Activity,
    AlertTriangle,
    BarChart3,
    Bell,
    CheckCircle,
    ChevronDown,
    Clock,
    LayoutDashboard,
    LogOut,
    Menu,
    Search,
    Server,
    Settings,
    Shield,
    ShieldAlert,
    Users,
    Wifi,
    X,
} from "lucide-react";

import {
    useLocation,
    Link,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import SecurityCard from "../../components/SecurityCard";
import SeverityBadge from "../../components/SeverityBadge";
import AppLayout from "../../components/AppLayout";

import {
    deleteSecurityEvent,
    subscribeToSecurityEvents,
} from "../../services/securityEvents";
import { processTrafficPacket } from "../../services/detectionEngine";

import "./Dashboard.css";

function formatEventTime(timestamp) {
    if (!timestamp) {
        return "Just now";
    }

    try {
        return timestamp.toDate().toLocaleString();
    } catch {
        return "Unknown";
    }
}


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({ children }) {

    const {
        user,
        logout,
    } = useAuth();

    const location = useLocation();

    const isAdmin =
        user?.role === "admin";


    /* =========================================================
       SIDEBAR
    ========================================================= */

    const [
        sidebarOpen,
        setSidebarOpen,
    ] = useState(() => window.innerWidth > 900);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setSidebarOpen(false);
            }
        };

        const handleResize = () => {
            if (window.innerWidth <= 900) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("resize", handleResize);
        };
    }, []);


    /* =========================================================
       SEARCH
    ========================================================= */

    const [
        search,
        setSearch,
    ] = useState("");


    /* =========================================================
       DROPDOWNS
    ========================================================= */

    const [
        showNotifications,
        setShowNotifications,
    ] = useState(false);

    const [
        showProfile,
        setShowProfile,
    ] = useState(false);


    /* =========================================================
       DEMO STATISTICS
    ========================================================= */

    /* =========================================================
       DEMO EVENTS
    ========================================================= */

    const [
        events,
        setEvents,
    ] = useState([]);

    const [eventsLoading, setEventsLoading] = useState(true);
    const [deletingNotificationId, setDeletingNotificationId] = useState(null);

    useEffect(() => {
        const unsubscribe = subscribeToSecurityEvents(
            (securityEvents) => {
                setEvents(
                    securityEvents.map((event) => ({
                        ...event,
                        event: event.eventType || "Unknown event",
                        time: formatEventTime(event.createdAt),
                    }))
                );
                setEventsLoading(false);
            },
            () => setEventsLoading(false)
        );

        return unsubscribe;
    }, []);

    const stats = {
        totalEvents: events.length,
        threats: events.filter((event) => ["HIGH", "CRITICAL"].includes(event.severity) && event.status !== "RESOLVED").length,
        critical: events.filter((event) => event.severity === "CRITICAL").length,
        normal: events.filter((event) => ["LOW", "MEDIUM"].includes(event.severity)).length,
    };

    const notifications = events
        .filter((event) => ["HIGH", "CRITICAL"].includes(event.severity) && event.status !== "RESOLVED")
        .slice(0, 4);

    const handleDeleteNotification = async (eventId) => {
        if (!isAdmin || deletingNotificationId) {
            return;
        }

        setDeletingNotificationId(eventId);
        await deleteSecurityEvent(eventId);
        setDeletingNotificationId(null);
    };


    /* =========================================================
       GENERATE TEST SECURITY EVENT
    ========================================================= */

    const generateTestEvent = async () => {

        if (!user?.uid) {

            alert(
                "User authentication not found."
            );

            return;
        }


        const randomIp =
            `192.168.1.${Math.floor(
                Math.random() * 220
            ) + 20}`;


        const testEvent = {

            sourceIp:
                randomIp,

            destinationIp:
                "192.168.1.1",

            eventType:
                "PORT_SCAN",

            protocol:
                "TCP",

            severity:
                "HIGH",

            status:
                "OPEN",

            source:
                "Detection Engine",

            description:
                "Test port scan event generated from the dashboard.",

            createdBy:
                user.uid,
        };

        try {
            const result = await processTrafficPacket(testEvent, user.uid);

            if (result.success) {
                alert("Security event created successfully!");
            } else {
                console.error("Failed to create event:", result.error);
                alert("Failed to create security event. Check the browser console.");
            }

        } catch (error) {

            console.error(
                "Unexpected error while creating event:",
                error
            );

            alert(
                "Unexpected error while creating security event."
            );
        }
    };


    /* =========================================================
       SEARCH EVENTS
    ========================================================= */

    const filteredEvents =
        events.filter((event) => {

            const searchText =
                search
                    .toLowerCase()
                    .trim();


            if (!searchText) {
                return true;
            }


            return (

                    event.sourceIp
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                event.event
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                event.protocol
                    .toLowerCase()
                    .includes(searchText)

                ||

                event.severity
                    .toLowerCase()
                    .includes(searchText)

                ||

                event.status
                    .toLowerCase()
                    .includes(searchText)

            );
        });


    /* =========================================================
       LOGOUT
    ========================================================= */

    const handleLogout = async () => {

        try {

            await logout();

        } catch (error) {

            console.error(
                "Logout failed:",
                error
            );
        }
    };


    /* =========================================================
       PAGE TITLE
    ========================================================= */

    const getPageTitle = () => {

        switch (location.pathname) {

            case "/events":
                return "Live Events";

            case "/alerts":
                return "Security Alerts";

            case "/analytics":
                return "Security Analytics";

            case "/rules":
                return "Detection Rules";

            case "/users":
                return "User Management";

            case "/settings":
                return "System Settings";

            case "/logs":
                return "Security Logs";

            default:
                return "Security Dashboard";
        }
    };


    /* =========================================================
       PAGE DESCRIPTION
    ========================================================= */

    const getPageDescription = () => {

        switch (location.pathname) {

            case "/events":
                return "Monitor live network security events.";

            case "/alerts":
                return "Review and investigate detected threats.";

            case "/analytics":
                return "Analyze network activity and security trends.";

            case "/rules":
                return "Configure and manage detection rules.";

            case "/users":
                return "Manage registered security analysts.";

            case "/settings":
                return "Manage system configuration.";

            case "/logs":
                return "Review system and security activity.";

            default:
                return "Monitor network activity and identify potential threats.";
        }
    };

    if (children) {
        return (
            <AppLayout
                notifications={notifications}
                onDeleteNotification={isAdmin ? handleDeleteNotification : undefined}
                deletingNotificationId={deletingNotificationId}
            >
                <section className="dashboard-content page-content">
                    {children}
                </section>
            </AppLayout>
        );
    }


    /* =========================================================
       UI
    ========================================================= */

    return (

        <div className="app-shell">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside
                className={`sidebar ${
                    sidebarOpen
                        ? "sidebar-open"
                        : "sidebar-closed"
                }`}
            >

                <div className="sidebar-header">

                    <div className="brand-icon">
                        <Shield size={21} />
                    </div>

                    <div className="brand-text">

                        <strong>
                            Network Sentinel
                        </strong>

                        <span>
                            Intrusion Detection
                        </span>

                    </div>

                </div>


                <nav className="sidebar-nav">

                    <div className="nav-section-title">
                        MONITORING
                    </div>

                    <SidebarLink
                        to="/dashboard"
                        icon={
                            <LayoutDashboard size={18} />
                        }
                        label="Dashboard"
                    />

                    <SidebarLink
                        to="/events"
                        icon={
                            <Activity size={18} />
                        }
                        label="Live Events"
                    />

                    <SidebarLink
                        to="/alerts"
                        icon={
                            <ShieldAlert size={18} />
                        }
                        label="Alerts"
                    />


                    <div className="nav-section-title">
                        ANALYSIS
                    </div>

                    <SidebarLink
                        to="/analytics"
                        icon={
                            <BarChart3 size={18} />
                        }
                        label="Analytics"
                    />


                    {isAdmin && (

                        <>

                            <div className="nav-section-title">
                                ADMINISTRATION
                            </div>

                            <SidebarLink
                                to="/rules"
                                icon={
                                    <Settings size={18} />
                                }
                                label="Detection Rules"
                            />

                            <SidebarLink
                                to="/users"
                                icon={
                                    <Users size={18} />
                                }
                                label="Users"
                            />

                            <SidebarLink
                                to="/settings"
                                icon={
                                    <Settings size={18} />
                                }
                                label="Settings"
                            />

                        </>

                    )}


                    <div className="nav-section-title">
                        SECURITY
                    </div>

                    <SidebarLink
                        to="/logs"
                        icon={
                            <Server size={18} />
                        }
                        label="Security Logs"
                    />

                </nav>


                <div className="sidebar-status">

                    <div className="sidebar-status-header">

                        <span className="status-indicator"></span>

                        <span>
                            Detection Engine
                        </span>

                    </div>

                    <strong>
                        Operational
                    </strong>

                    <small>
                        All detection rules active
                    </small>

                </div>


                <div className="sidebar-user">

                    <div className="user-avatar">

                        {user?.email
                            ?.charAt(0)
                            ?.toUpperCase() || "A"}

                    </div>

                    <div className="user-info">

                        <strong>
                            {user?.name ||
                                "Security Analyst"}
                        </strong>

                        <span>
                            {user?.email ||
                                "Analyst"}
                        </span>

                    </div>

                </div>

            </aside>

            {sidebarOpen && (
                <button
                    className="sidebar-backdrop"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close navigation"
                />
            )}


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="main-container">

                {/* TOPBAR */}

                <header className="topbar">

                    <div className="topbar-left">

                        <button
                            className="menu-button"
                            onClick={() =>
                                setSidebarOpen(
                                    (previous) =>
                                        !previous
                                )
                            }
                            aria-label="Toggle sidebar"
                        >

                            {sidebarOpen ? (
                                <X size={20} />
                            ) : (
                                <Menu size={20} />
                            )}

                        </button>


                        <div className="page-heading">

                            <h1>
                                {getPageTitle()}
                            </h1>

                            <span>
                                Security Operations Center
                            </span>

                        </div>

                    </div>


                    <div className="topbar-actions">

                        <div className="global-search">

                            <Search size={17} />

                            <input
                                type="text"
                                placeholder="Search events..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="action-wrapper">

                            <button
                                className="topbar-icon-button"
                                onClick={() =>
                                    setShowNotifications(
                                        (previous) =>
                                            !previous
                                    )
                                }
                                aria-label="Notifications"
                            >

                                <Bell size={19} />

                                {notifications.length > 0 && (
                                    <span className="notification-dot"></span>
                                )}

                            </button>


                            {showNotifications && (

                                <div className="dropdown notification-dropdown">

                                    <div className="dropdown-header">
                                        Notifications
                                    </div>

                                    {notifications.length > 0 ? notifications.map((notification) => (
                                        <div className="notification-item" key={notification.id}>
                                            {notification.severity === "CRITICAL" ? <AlertTriangle size={16} /> : <Activity size={16} />}
                                            <div>
                                                <strong>{notification.eventType || "Security event detected"}</strong>
                                                <span>{notification.sourceIp || "Unknown source"} - {formatEventTime(notification.createdAt)}</span>
                                            </div>
                                            {isAdmin && <button className="notification-dismiss" onClick={() => handleDeleteNotification(notification.id)} disabled={deletingNotificationId === notification.id} aria-label="Delete notification">
                                                {deletingNotificationId === notification.id ? <CheckCircle size={14} /> : <X size={14} />}
                                            </button>}
                                        </div>
                                    )) : (
                                        <div className="notification-empty">No active security notifications.</div>
                                    )}

                                </div>

                            )}

                        </div>


                        <div className="profile-wrapper">

                            <button
                                className="profile-button"
                                onClick={() =>
                                    setShowProfile(
                                        (previous) =>
                                            !previous
                                    )
                                }
                            >

                                <div className="profile-avatar">

                                    {user?.email
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                        "A"}

                                </div>


                                <div className="profile-text">

                                    <strong>
                                        {user?.name ||
                                            "Security Analyst"}
                                    </strong>

                                    <span>
                                        {isAdmin
                                            ? "Administrator"
                                            : "Analyst"}
                                    </span>

                                </div>


                                <ChevronDown
                                    size={16}
                                />

                            </button>


                            {showProfile && (

                                <div className="dropdown profile-dropdown">

                                    <div className="dropdown-user">

                                        <strong>
                                            {user?.name ||
                                                "Security Analyst"}
                                        </strong>

                                        <span>
                                            {user?.email}
                                        </span>

                                        <small>
                                            {isAdmin
                                                ? "Administrator"
                                                : "Security Analyst"}
                                        </small>

                                    </div>


                                    <button
                                        className="logout-button"
                                        onClick={
                                            handleLogout
                                        }
                                    >

                                        <LogOut size={16} />

                                        Sign Out

                                    </button>

                                </div>

                            )}

                        </div>

                    </div>

                </header>


                {/* CONTENT */}

                <section
                    className={`dashboard-content ${
                        children
                            ? "page-content"
                            : ""
                    }`}
                >

                    {children ? children : (

                    <>

                    <div className="content-header">

                        <div>

                            <div className="content-eyebrow">

                                <span></span>

                                SECURITY MONITORING

                            </div>

                            <h2>

                                {location.pathname ===
                                "/dashboard"
                                    ? "Security Overview"
                                    : getPageTitle()}

                            </h2>

                            <p>
                                {getPageDescription()}
                            </p>

                        </div>


                        <div className="content-actions">

                            <button
                                className="secondary-button"
                                onClick={() =>
                                    window.location.reload()
                                }
                            >
                                Refresh
                            </button>


                            <button
                                className="primary-button"
                                onClick={
                                    generateTestEvent
                                }
                            >
                                + Generate Test Event
                            </button>

                        </div>

                    </div>


                    {/* STAT CARDS */}

                    <div className="stats-grid">

                        <SecurityCard
                            title="Total Events"
                            value={
                                stats.totalEvents
                            }
                            subtitle="Last 24 hours"
                            icon={
                                <Activity size={21} />
                            }
                            type="blue"
                        />

                        <SecurityCard
                            title="Active Threats"
                            value={
                                stats.threats
                            }
                            subtitle="Requires attention"
                            icon={
                                <ShieldAlert size={21} />
                            }
                            type="orange"
                        />

                        <SecurityCard
                            title="Critical Alerts"
                            value={
                                stats.critical
                            }
                            subtitle="Immediate action"
                            icon={
                                <AlertTriangle size={21} />
                            }
                            type="red"
                        />

                        <SecurityCard
                            title="Normal Events"
                            value={
                                stats.normal
                            }
                            subtitle="No action required"
                            icon={
                                <CheckCircle size={21} />
                            }
                            type="green"
                        />

                    </div>


                    {/* CHARTS */}

                    <div className="dashboard-grid">

                        <div className="dashboard-panel">

                            <div className="panel-header">

                                <div>

                                    <h3>
                                        Network Activity
                                    </h3>

                                    <span>
                                        Events detected over
                                        the last 24 hours
                                    </span>

                                </div>

                                <Wifi size={19} />

                            </div>


                            <div className="activity-chart">

                                <div className="chart-bars">

                                    {[
                                        35,
                                        48,
                                        42,
                                        65,
                                        52,
                                        78,
                                        61,
                                        72,
                                        45,
                                        85,
                                        69,
                                        92,
                                    ].map(
                                        (
                                            height,
                                            index
                                        ) => (

                                            <div
                                                className="chart-column"
                                                key={index}
                                            >

                                                <div
                                                    className="chart-bar"
                                                    style={{
                                                        height:
                                                            `${height}%`,
                                                    }}
                                                />

                                                <span>
                                                    {index + 1}h
                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        </div>


                        <div className="dashboard-panel">

                            <div className="panel-header">

                                <div>

                                    <h3>
                                        Threat Distribution
                                    </h3>

                                    <span>
                                        Current severity levels
                                    </span>

                                </div>

                                <ShieldAlert size={19} />

                            </div>


                            <div className="threat-list">

                                <ThreatRow
                                    label="Critical"
                                    value={8}
                                    total={31}
                                    type="critical"
                                />

                                <ThreatRow
                                    label="High"
                                    value={12}
                                    total={31}
                                    type="high"
                                />

                                <ThreatRow
                                    label="Medium"
                                    value={7}
                                    total={31}
                                    type="medium"
                                />

                                <ThreatRow
                                    label="Low"
                                    value={4}
                                    total={31}
                                    type="low"
                                />

                            </div>

                        </div>

                    </div>


                    {/* EVENTS */}

                    <div className="dashboard-panel events-panel" aria-busy={eventsLoading}>

                        <div className="panel-header">

                            <div>

                                <h3>
                                    Recent Security Events
                                </h3>

                                <span>
                                    Latest activity detected
                                    by the monitoring engine
                                </span>

                            </div>


                            <Link
                                to="/events"
                                className="view-all"
                            >
                                View all
                            </Link>

                        </div>


                        <div className="events-table-wrapper">

                            <table className="events-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Source IP
                                        </th>

                                        <th>
                                            Event
                                        </th>

                                        <th>
                                            Protocol
                                        </th>

                                        <th>
                                            Severity
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Time
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredEvents.map(
                                        (event) => (

                                            <tr
                                                key={
                                                    event.id
                                                }
                                            >

                                                <td>

                                                    <span className="ip-address">
                                                        {
                                                            event.sourceIp
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <strong>
                                                        {
                                                            event.event
                                                        }
                                                    </strong>

                                                </td>


                                                <td>

                                                    <span className="protocol">
                                                        {
                                                            event.protocol
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <SeverityBadge
                                                        severity={
                                                            event.severity
                                                        }
                                                    />

                                                </td>


                                                <td>

                                                    <span
                                                        className={`event-status ${event.status.toLowerCase()}`}
                                                    >
                                                        {
                                                            event.status
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="event-time">

                                                        <Clock
                                                            size={13}
                                                        />

                                                        {
                                                            event.time
                                                        }

                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>


                            {filteredEvents.length === 0 && (

                                <div className="empty-state">

                                    <Search size={22} />

                                    <p>
                                        {eventsLoading
                                            ? "Loading security events..."
                                            : "No security events have been recorded yet."}
                                    </p>

                                    {!eventsLoading && (
                                        <button
                                            className="empty-state-action"
                                            onClick={generateTestEvent}
                                        >
                                            Generate first event
                                        </button>
                                    )}

                                </div>

                            )}

                        </div>

                    </div>

                    </>

                    )}

                </section>

            </main>

        </div>
    );
}


/* =========================================================
   SIDEBAR LINK
========================================================= */

function SidebarLink({
    to,
    icon,
    label,
}) {

    const location =
        useLocation();

    const isActive =
        location.pathname === to;

    return (

        <Link
            to={to}
            className={`sidebar-link ${
                isActive
                    ? "active"
                    : ""
            }`}
        >

            {icon}

            <span>
                {label}
            </span>

        </Link>
    );
}


/* =========================================================
   THREAT ROW
========================================================= */

function ThreatRow({
    label,
    value,
    total,
    type,
}) {

    const percentage =
        Math.round(
            (value / total) * 100
        );

    return (

        <div className="threat-row">

            <div className="threat-row-header">

                <div className="threat-name">

                    <span
                        className={`threat-dot ${type}`}
                    />

                    <span>
                        {label}
                    </span>

                </div>

                <strong>
                    {value}
                </strong>

            </div>


            <div className="threat-progress">

                <div
                    className={`threat-progress-fill ${type}`}
                    style={{
                        width:
                            `${percentage}%`,
                    }}
                />

            </div>

        </div>
    );
}


export default Dashboard;