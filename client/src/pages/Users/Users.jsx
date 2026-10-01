import { useEffect, useMemo, useState } from "react";

import {
    collection,
    getDocs,
    updateDoc,
    doc,
} from "firebase/firestore";

import {
    Search,
    RefreshCw,
    Users as UsersIcon,
    Shield,
    UserCheck,
    UserX,
    ChevronDown,
    Loader2,
} from "lucide-react";

import { db } from "../../services/firebase";

import "./Users.css";


/* =========================================================
   USERS PAGE
========================================================= */

function Users() {

    const [users, setUsers] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [roleFilter, setRoleFilter] =
        useState("all");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [updatingUserId, setUpdatingUserId] =
        useState(null);


    /* =====================================================
       LOAD USERS
    ===================================================== */

    const loadUsers = async (
        showRefreshLoader = false
    ) => {

        try {

            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");


            /*
             * We intentionally use getDocs instead of
             * onSnapshot here.
             *
             * Users management does not need a permanent
             * real-time listener.
             *
             * This reduces unnecessary Firestore reads.
             */

            const usersSnapshot =
                await getDocs(
                    collection(db, "users")
                );


            const usersData =
                usersSnapshot.docs.map(
                    (userDocument) => {

                        const data =
                            userDocument.data();

                        return {
                            id: userDocument.id,

                            uid:
                                data.uid ||
                                userDocument.id,

                            name:
                                data.name ||
                                "Unknown User",

                            email:
                                data.email ||
                                "No email",

                            role:
                                data.role ||
                                "analyst",

                            status:
                                data.status ||
                                "active",

                            createdAt:
                                data.createdAt ||
                                null,

                            updatedAt:
                                data.updatedAt ||
                                null,
                        };
                    }
                );


            /*
             * Newest users first.
             *
             * Sorting is done locally so we don't need
             * a Firestore orderBy query/index.
             */

            usersData.sort(
                (a, b) => {

                    const dateA =
                        getTimestampValue(
                            a.createdAt
                        );

                    const dateB =
                        getTimestampValue(
                            b.createdAt
                        );

                    return dateB - dateA;
                }
            );


            setUsers(usersData);

        } catch (error) {

            console.error(
                "Failed to load users:",
                error
            );

            setError(
                "Unable to load users. Please check your Firestore permissions."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        const initialLoad =
            window.setTimeout(
                () => loadUsers(),
                0
            );

        return () =>
            window.clearTimeout(
                initialLoad
            );
    }, []);


    /* =====================================================
       FILTERED USERS
    ===================================================== */

    const filteredUsers = useMemo(() => {

        const searchText =
            search
                .toLowerCase()
                .trim();


        return users.filter(
            (user) => {

                const matchesSearch =
                    !searchText ||
                    user.name
                        .toLowerCase()
                        .includes(searchText) ||
                    user.email
                        .toLowerCase()
                        .includes(searchText) ||
                    user.role
                        .toLowerCase()
                        .includes(searchText);


                const matchesRole =
                    roleFilter === "all" ||
                    user.role === roleFilter;


                const matchesStatus =
                    statusFilter === "all" ||
                    user.status === statusFilter;


                return (
                    matchesSearch &&
                    matchesRole &&
                    matchesStatus
                );
            }
        );

    }, [
        users,
        search,
        roleFilter,
        statusFilter,
    ]);


    /* =====================================================
       STATISTICS
    ===================================================== */

    const totalUsers =
        users.length;


    const activeUsers =
        users.filter(
            (user) =>
                user.status === "active"
        ).length;


    const analystUsers =
        users.filter(
            (user) =>
                user.role === "analyst"
        ).length;


    const adminUsers =
        users.filter(
            (user) =>
                user.role === "admin"
        ).length;


    /* =====================================================
       CHANGE USER STATUS
    ===================================================== */

    const toggleUserStatus = async (user) => {

        const newStatus =
            user.status === "active"
                ? "disabled"
                : "active";


        const confirmed =
            window.confirm(
                `Change ${user.name}'s status to ${newStatus}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setUpdatingUserId(user.id);


            const userRef =
                doc(
                    db,
                    "users",
                    user.id
                );


            await updateDoc(
                userRef,
                {
                    status: newStatus,
                }
            );


            /*
             * Update local state immediately.
             * No extra Firestore read required.
             */

            setUsers(
                (previousUsers) =>
                    previousUsers.map(
                        (existingUser) =>
                            existingUser.id ===
                            user.id
                                ? {
                                      ...existingUser,
                                      status:
                                          newStatus,
                                  }
                                : existingUser
                    )
            );

        } catch (error) {

            console.error(
                "Failed to update user status:",
                error
            );

            window.alert(
                "Unable to update user status. Check your Firestore permissions."
            );

        } finally {

            setUpdatingUserId(null);
        }
    };


    /* =====================================================
       DATE FORMAT
    ===================================================== */

    const formatDate = (timestamp) => {

        const value =
            getTimestampValue(timestamp);


        if (!value) {
            return "—";
        }


        return new Date(value).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (
            <div className="users-page">

                <div className="users-loading">

                    <Loader2
                        size={24}
                        className="users-spinner"
                    />

                    <span>
                        Loading users...
                    </span>

                </div>

            </div>
        );
    }


    /* =====================================================
       PAGE
    ===================================================== */

    return (
        <div className="users-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="users-page-header">

                <div>

                    <div className="users-eyebrow">
                        <span></span>
                        ADMINISTRATION
                    </div>


                    <h2>
                        User Management
                    </h2>


                    <p>
                        Manage registered analysts and
                        administrators.
                    </p>

                </div>


                <button
                    className="users-refresh-button"
                    onClick={() =>
                        loadUsers(true)
                    }
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={16}
                        className={
                            refreshing
                                ? "users-spinner"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="users-error">

                    {error}

                </div>
            )}


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="users-stats-grid">


                {/* TOTAL */}

                <UserStatCard
                    title="Total Users"
                    value={totalUsers}
                    icon={
                        <UsersIcon size={20} />
                    }
                    type="blue"
                />


                {/* ACTIVE */}

                <UserStatCard
                    title="Active Users"
                    value={activeUsers}
                    icon={
                        <UserCheck size={20} />
                    }
                    type="green"
                />


                {/* ANALYST */}

                <UserStatCard
                    title="Analysts"
                    value={analystUsers}
                    icon={
                        <UsersIcon size={20} />
                    }
                    type="orange"
                />


                {/* ADMIN */}

                <UserStatCard
                    title="Administrators"
                    value={adminUsers}
                    icon={
                        <Shield size={20} />
                    }
                    type="purple"
                />

            </div>


            {/* =================================================
                USER TABLE PANEL
            ================================================= */}

            <div className="users-panel">


                {/* =================================================
                    FILTER BAR
                ================================================= */}

                <div className="users-toolbar">


                    {/* SEARCH */}

                    <div className="users-search">

                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Search by name, email or role..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    {/* ROLE */}

                    <div className="users-select">

                        <select
                            value={roleFilter}
                            onChange={(event) =>
                                setRoleFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="all">
                                All Roles
                            </option>

                            <option value="admin">
                                Administrators
                            </option>

                            <option value="analyst">
                                Analysts
                            </option>

                        </select>

                        <ChevronDown
                            size={15}
                        />

                    </div>


                    {/* STATUS */}

                    <div className="users-select">

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="all">
                                All Status
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="disabled">
                                Disabled
                            </option>

                        </select>

                        <ChevronDown
                            size={15}
                        />

                    </div>

                </div>


                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="users-table-wrapper">

                    <table className="users-table">

                        <thead>

                            <tr>

                                <th>
                                    USER
                                </th>

                                <th>
                                    EMAIL
                                </th>

                                <th>
                                    ROLE
                                </th>

                                <th>
                                    STATUS
                                </th>

                                <th>
                                    CREATED
                                </th>

                                <th>
                                    ACTION
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredUsers.map(
                                (user) => (

                                    <tr
                                        key={user.id}
                                    >


                                        {/* USER */}

                                        <td>

                                            <div className="user-cell">

                                                <div className="user-table-avatar">

                                                    {getInitial(
                                                        user.name
                                                    )}

                                                </div>


                                                <div className="user-cell-info">

                                                    <strong>
                                                        {user.name}
                                                    </strong>

                                                    <span>
                                                        {user.uid}
                                                    </span>

                                                </div>

                                            </div>

                                        </td>


                                        {/* EMAIL */}

                                        <td>

                                            <span className="user-email">

                                                {user.email}

                                            </span>

                                        </td>


                                        {/* ROLE */}

                                        <td>

                                            <RoleBadge
                                                role={
                                                    user.role
                                                }
                                            />

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <StatusBadge
                                                status={
                                                    user.status
                                                }
                                            />

                                        </td>


                                        {/* CREATED */}

                                        <td>

                                            <span className="user-date">

                                                {formatDate(
                                                    user.createdAt
                                                )}

                                            </span>

                                        </td>


                                        {/* ACTION */}

                                        <td>

                                            <button
                                                className={`user-status-button ${
                                                    user.status ===
                                                    "active"
                                                        ? "disable"
                                                        : "enable"
                                                }`}
                                                onClick={() =>
                                                    toggleUserStatus(
                                                        user
                                                    )
                                                }
                                                disabled={
                                                    updatingUserId ===
                                                    user.id
                                                }
                                            >

                                                {updatingUserId ===
                                                user.id ? (

                                                    <Loader2
                                                        size={14}
                                                        className="users-spinner"
                                                    />

                                                ) : user.status ===
                                                  "active" ? (

                                                    <>
                                                        <UserX
                                                            size={14}
                                                        />

                                                        Disable
                                                    </>

                                                ) : (

                                                    <>
                                                        <UserCheck
                                                            size={14}
                                                        />

                                                        Enable
                                                    </>
                                                )}

                                            </button>

                                        </td>

                                    </tr>
                                )
                            )}

                        </tbody>

                    </table>


                    {/* =================================================
                        EMPTY STATE
                    ================================================= */}

                    {filteredUsers.length === 0 && (

                        <div className="users-empty">

                            <UsersIcon
                                size={28}
                            />

                            <strong>
                                No users found
                            </strong>

                            <span>
                                Try changing your search
                                or filters.
                            </span>

                        </div>
                    )}

                </div>


                {/* =================================================
                    TABLE FOOTER
                ================================================= */}

                <div className="users-table-footer">

                    Showing{" "}

                    <strong>
                        {filteredUsers.length}
                    </strong>

                    {" "}of{" "}

                    <strong>
                        {users.length}
                    </strong>

                    {" "}users

                </div>

            </div>

        </div>
    );
}


/* =========================================================
   USER STAT CARD
========================================================= */

function UserStatCard({
    title,
    value,
    icon,
    type,
}) {

    return (
        <div
            className={`user-stat-card ${type}`}
        >

            <div className="user-stat-icon">
                {icon}
            </div>


            <div className="user-stat-content">

                <span>
                    {title}
                </span>

                <strong>
                    {value}
                </strong>

            </div>

        </div>
    );
}


/* =========================================================
   ROLE BADGE
========================================================= */

function RoleBadge({
    role,
}) {

    return (
        <span
            className={`role-badge ${role}`}
        >

            {role === "admin"
                ? "Administrator"
                : "Analyst"}

        </span>
    );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
    status,
}) {

    return (
        <span
            className={`status-badge ${status}`}
        >

            <span className="status-badge-dot"></span>

            {status === "active"
                ? "Active"
                : "Disabled"}

        </span>
    );
}


/* =========================================================
   HELPERS
========================================================= */

function getInitial(name) {

    if (!name) {
        return "U";
    }


    return name
        .trim()
        .charAt(0)
        .toUpperCase();
}


function getTimestampValue(timestamp) {

    if (!timestamp) {
        return 0;
    }


    /*
     * Firebase Timestamp
     */

    if (
        typeof timestamp.toMillis ===
        "function"
    ) {
        return timestamp.toMillis();
    }


    /*
     * JavaScript Date
     */

    if (
        timestamp instanceof Date
    ) {
        return timestamp.getTime();
    }


    /*
     * Firestore Timestamp-like object
     */

    if (
        timestamp.seconds
    ) {
        return (
            timestamp.seconds * 1000
        );
    }


    /*
     * String / number fallback
     */

    const parsed =
        new Date(timestamp).getTime();


    return Number.isNaN(parsed)
        ? 0
        : parsed;
}


export default Users;