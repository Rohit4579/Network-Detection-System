import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Filter,
    RefreshCw,
    Search,
    ShieldAlert,
    Trash2,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    deleteSecurityEvent,
    subscribeToSecurityEvents,
    updateSecurityEventStatus,
} from "../../services/securityEvents";

import { useAuth } from "../../context/AuthContext";

import "./Alerts.css";


function Alerts() {
    const { user, isAdmin, isAnalyst } = useAuth();
    const canManageAlerts = isAdmin || isAnalyst;

    const [events, setEvents] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [updatingId, setUpdatingId] =
        useState(null);

    const [deletingId, setDeletingId] =
        useState(null);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [severityFilter, setSeverityFilter] =
        useState("ALL");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [refreshKey, setRefreshKey] =
        useState(0);


    /* =========================================================
       REAL-TIME SECURITY EVENT LISTENER
    ========================================================= */

    useEffect(() => {
        const unsubscribe =
            subscribeToSecurityEvents(
                (data) => {

                    /*
                     * Alerts are derived from security events.
                     *
                     * Only HIGH and CRITICAL events
                     * are considered security alerts.
                     */

                    const alertEvents =
                        data.filter(
                            (event) =>
                                event.severity ===
                                    "HIGH" ||
                                event.severity ===
                                    "CRITICAL"
                        );

                    setEvents(alertEvents);

                    setLoading(false);
                },

                (listenerError) => {
                    console.error(
                        "Alerts listener error:",
                        listenerError
                    );

                    setError(
                        listenerError?.code === "permission-denied"
                            ? "Your account cannot read security alerts. Deploy the Firestore rules and sign in again."
                            : "Failed to load security alerts."
                    );

                    setLoading(false);
                }
            );

        return () => {
            unsubscribe();
        };
    }, [refreshKey]);


    /* =========================================================
       SUMMARY
    ========================================================= */

    const totalAlerts =
        events.length;

    const criticalAlerts =
        events.filter(
            (event) =>
                event.severity ===
                "CRITICAL"
        ).length;

    const highAlerts =
        events.filter(
            (event) =>
                event.severity ===
                "HIGH"
        ).length;

    const openAlerts =
        events.filter(
            (event) =>
                event.status ===
                "OPEN"
        ).length;


    /* =========================================================
       FILTER ALERTS
    ========================================================= */

    const filteredAlerts =
        useMemo(() => {

            return events.filter(
                (event) => {

                    const search =
                        searchTerm
                            .toLowerCase()
                            .trim();


                    const matchesSearch =
                        !search ||
                        event.sourceIp
                            ?.toLowerCase()
                            .includes(search) ||
                        event.destinationIp
                            ?.toLowerCase()
                            .includes(search) ||
                        event.eventType
                            ?.toLowerCase()
                            .includes(search) ||
                        event.protocol
                            ?.toLowerCase()
                            .includes(search);


                    const matchesSeverity =
                        severityFilter ===
                            "ALL" ||
                        event.severity ===
                            severityFilter;


                    const matchesStatus =
                        statusFilter ===
                            "ALL" ||
                        event.status ===
                            statusFilter;


                    return (
                        matchesSearch &&
                        matchesSeverity &&
                        matchesStatus
                    );
                }
            );

        }, [
            events,
            searchTerm,
            severityFilter,
            statusFilter,
        ]);


    /* =========================================================
       CLEAR FILTERS
    ========================================================= */

    const clearFilters = () => {

        setSearchTerm("");

        setSeverityFilter("ALL");

        setStatusFilter("ALL");
    };


    /* =========================================================
       REFRESH
    ========================================================= */

    const handleRefresh = () => {

        setRefreshKey(
            (previous) =>
                previous + 1
        );
    };


    /* =========================================================
       UPDATE ALERT STATUS
    ========================================================= */

    const handleStatusChange =
        async (
            eventId,
            newStatus
        ) => {

            /*
             * Only admin can modify alert status.
             *
             * The UI hides these controls for analysts,
             * but Firestore rules must also enforce this.
             */

            if (!canManageAlerts || (!isAdmin && newStatus === "RESOLVED")) {

                setError(
                    isAdmin
                        ? "Invalid alert status change."
                        : "Analysts can move alerts to Investigating."
                );

                return;
            }


            if (!eventId) {

                setError(
                    "Invalid alert ID."
                );

                return;
            }


            setUpdatingId(eventId);

            setError("");


            const result =
                await updateSecurityEventStatus(
                    eventId,
                    newStatus,
                    user?.uid
                );


            if (!result.success) {

                setError(
                    "Failed to update alert status."
                );
            }


            setUpdatingId(null);
        };


    const handleDelete = async (eventId) => {
        if (!isAdmin || !eventId || deletingId) {
            return;
        }

        const shouldDelete = window.confirm(
            "Delete this security alert permanently from Firebase?"
        );

        if (!shouldDelete) {
            return;
        }

        setDeletingId(eventId);
        setError("");

        const result = await deleteSecurityEvent(eventId);

        if (!result.success) {
            setError("Failed to delete alert from Firebase.");
        }

        setDeletingId(null);
    };


    /* =========================================================
       FORMAT TIME
    ========================================================= */

    const formatTime =
        (timestamp) => {

            if (!timestamp) {
                return "Just now";
            }

            try {

                return timestamp
                    .toDate()
                    .toLocaleString();

            } catch {

                return "Unknown";
            }
        };


    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="alerts-page">

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="alerts-summary">

                <div className="alert-summary-card">

                    <div className="alert-summary-icon blue">
                        <ShieldAlert
                            size={19}
                        />
                    </div>

                    <div>

                        <span>
                            TOTAL ALERTS
                        </span>

                        <strong>
                            {totalAlerts}
                        </strong>

                    </div>

                </div>


                <div className="alert-summary-card">

                    <div className="alert-summary-icon red">
                        <AlertTriangle
                            size={19}
                        />
                    </div>

                    <div>

                        <span>
                            CRITICAL
                        </span>

                        <strong>
                            {criticalAlerts}
                        </strong>

                    </div>

                </div>


                <div className="alert-summary-card">

                    <div className="alert-summary-icon orange">
                        <AlertTriangle
                            size={19}
                        />
                    </div>

                    <div>

                        <span>
                            HIGH
                        </span>

                        <strong>
                            {highAlerts}
                        </strong>

                    </div>

                </div>


                <div className="alert-summary-card">

                    <div className="alert-summary-icon green">
                        <Clock
                            size={19}
                        />
                    </div>

                    <div>

                        <span>
                            OPEN
                        </span>

                        <strong>
                            {openAlerts}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="alerts-toolbar">

                <div className="alerts-search">

                    <Search size={15} />

                    <input
                        type="text"
                        placeholder="Search IP, alert type or protocol..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="alerts-filters">

                    <div className="alert-filter-control">

                        <Filter size={14} />

                        <select
                            value={
                                severityFilter
                            }
                            onChange={(event) =>
                                setSeverityFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="ALL">
                                All Severity
                            </option>

                            <option value="CRITICAL">
                                Critical
                            </option>

                            <option value="HIGH">
                                High
                            </option>

                        </select>

                    </div>


                    <div className="alert-filter-control">

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="ALL">
                                All Status
                            </option>

                            <option value="OPEN">
                                Open
                            </option>

                            <option value="INVESTIGATING">
                                Investigating
                            </option>

                            <option value="RESOLVED">
                                Resolved
                            </option>

                        </select>

                    </div>


                    <button
                        className="alert-clear-button"
                        onClick={
                            clearFilters
                        }
                    >
                        Clear
                    </button>


                    <button
                        className="alert-refresh-button"
                        onClick={
                            handleRefresh
                        }
                        title="Refresh alerts"
                    >

                        <RefreshCw
                            size={15}
                        />

                    </button>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="alerts-error">

                    <AlertTriangle
                        size={16}
                    />

                    {error}

                </div>
            )}

            {criticalAlerts > 0 && (
                <div className="critical-alert-banner">
                    <div>
                        <strong>Critical response required</strong>
                        <span>{criticalAlerts} critical event{criticalAlerts === 1 ? "" : "s"} need immediate investigation.</span>
                    </div>
                    <button onClick={() => setSeverityFilter("CRITICAL")}>Review critical alerts</button>
                </div>
            )}


            {/* =================================================
                ALERT PANEL
            ================================================= */}

            <div className="alerts-panel">

                <div className="alerts-panel-header">

                    <div>

                        <h3>
                            Security Alerts
                        </h3>

                        <span>
                            Showing{" "}
                            {filteredAlerts.length}{" "}
                            of{" "}
                            {events.length}{" "}
                            alerts
                        </span>

                    </div>


                    <div className="alerts-live-indicator">

                        <span></span>

                        Live

                    </div>

                </div>


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading ? (

                    <div className="alerts-loading">

                        <RefreshCw
                            size={25}
                            className="alert-spinner"
                        />

                        <p>
                            Loading security alerts...
                        </p>

                    </div>

                ) : filteredAlerts.length === 0 ? (

                    /* =================================================
                       EMPTY
                    ================================================= */

                    <div className="alerts-empty">

                        <CheckCircle
                            size={36}
                        />

                        <strong>
                            No security alerts found
                        </strong>

                        <span>
                            No HIGH or CRITICAL
                            events match the
                            selected filters.
                        </span>

                    </div>

                ) : (

                    /* =================================================
                       TABLE
                    ================================================= */

                    <div className="alerts-table-wrapper">

                        <table className="alerts-table">

                            <thead>

                                <tr>

                                    <th>
                                        TIME
                                    </th>

                                    <th>
                                        ALERT
                                    </th>

                                    <th>
                                        SOURCE IP
                                    </th>

                                    <th>
                                        DESTINATION
                                    </th>

                                    <th>
                                        PROTOCOL
                                    </th>

                                    <th>
                                        SEVERITY
                                    </th>

                                    <th>
                                        STATUS
                                    </th>

                                    {canManageAlerts && (
                                        <th>
                                            ACTION
                                        </th>
                                    )}

                                </tr>

                            </thead>


                            <tbody>

                                {filteredAlerts.map(
                                    (alert) => {

                                        const severity =
                                            alert.severity
                                                ?.toLowerCase() ||
                                            "high";

                                        const status =
                                            alert.status
                                                ?.toLowerCase() ||
                                            "open";


                                        return (
                                            <tr
                                                key={
                                                    alert.id
                                                }
                                            >

                                                {/* TIME */}

                                                <td>

                                                    <span className="alert-time">

                                                        <Clock
                                                            size={13}
                                                        />

                                                        {formatTime(
                                                            alert.createdAt
                                                        )}

                                                    </span>

                                                </td>


                                                {/* ALERT */}

                                                <td>

                                                    <div className="alert-name-cell">

                                                        <strong>
                                                            {
                                                                alert.eventType ||
                                                                "SECURITY ALERT"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                alert.description ||
                                                                "Suspicious activity detected."
                                                            }
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* SOURCE */}

                                                <td>

                                                    <span className="alert-ip">
                                                        {
                                                            alert.sourceIp ||
                                                            "Unknown"
                                                        }
                                                    </span>

                                                </td>


                                                {/* DESTINATION */}

                                                <td>

                                                    <span className="alert-ip">
                                                        {
                                                            alert.destinationIp ||
                                                            "Unknown"
                                                        }
                                                    </span>

                                                </td>


                                                {/* PROTOCOL */}

                                                <td>

                                                    <span className="alert-protocol">
                                                        {
                                                            alert.protocol ||
                                                            "Unknown"
                                                        }
                                                    </span>

                                                </td>


                                                {/* SEVERITY */}

                                                <td>

                                                    <span
                                                        className={`alert-severity-badge ${severity}`}
                                                    >
                                                        {
                                                            alert.severity
                                                        }
                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`alert-status-badge ${status}`}
                                                    >
                                                        {
                                                            alert.status
                                                        }
                                                    </span>

                                                </td>


                                                {/* ADMIN ACTION */}

                                                {canManageAlerts && (
                                                    <td>

                                                        {updatingId === alert.id || deletingId === alert.id ? (

                                                            <RefreshCw
                                                                size={15}
                                                                className="alert-spinner"
                                                            />

                                                        ) : (

                                                            <div className="alert-actions">

                                                                {alert.status ===
                                                                    "OPEN" && (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleStatusChange(
                                                                                alert.id,
                                                                                "INVESTIGATING"
                                                                            )
                                                                        }
                                                                    >
                                                                        Investigate
                                                                    </button>
                                                                )}


                                                                {isAdmin && alert.status ===
                                                                    "INVESTIGATING" && (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleStatusChange(
                                                                                alert.id,
                                                                                "RESOLVED"
                                                                            )
                                                                        }
                                                                    >
                                                                        Resolve
                                                                    </button>
                                                                )}


                                                                {alert.status === "RESOLVED" && (
                                                                    <span className="resolved-label">
                                                                        <CheckCircle size={13} />
                                                                        Resolved
                                                                    </span>
                                                                )}

                                                                {isAdmin && (
                                                                    <button
                                                                        className="alert-delete-button"
                                                                        onClick={() => handleDelete(alert.id)}
                                                                        title="Delete alert permanently"
                                                                        aria-label={`Delete ${alert.eventType || "security alert"}`}
                                                                    >
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                )}

                                                            </div>

                                                        )}

                                                    </td>
                                                )}

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}


export default Alerts;