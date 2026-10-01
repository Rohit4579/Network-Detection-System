import { useEffect, useState } from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "../pages/Dashboard/Dashboard.css";
import "./AppLayout.css";

function AppLayout({ children, notifications = [], onDeleteNotification, deletingNotificationId }) {
    const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

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

    const closeSidebarOnMobile = () => {
        if (window.innerWidth <= 900) {
            setSidebarOpen(false);
        }
    };

    return (
        <div className="app-shell">
            <Sidebar open={sidebarOpen} onClose={closeSidebarOnMobile} />
            {sidebarOpen && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
            <main className="main-container">
                <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((value) => !value)} notifications={notifications} onDeleteNotification={onDeleteNotification} deletingNotificationId={deletingNotificationId} />
                {children}
            </main>
        </div>
    );
}

export default AppLayout;
