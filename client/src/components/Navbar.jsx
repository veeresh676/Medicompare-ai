import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import api from "../api/api";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const notificationRef = useRef(null);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const navItems = [
        {
            label: "Hospitals",
            path: "/hospitals",
        },
        {
            label: "Compare",
            path: "/compare",
        },
        {
            label: "AI Chat",
            path: "/ai-chat",
        },
        {
            label: "Map",
            path: "/map",
        },
        {
            label: "Bookings",
            path: "/bookings",
        },
        {
            label: "Profile",
            path: "/profile",
        },
    ];

    /*
     * ============================================================
     * LOAD NOTIFICATION COUNT
     * ============================================================
     */

    useEffect(() => {
        loadUnreadCount();

        const interval = setInterval(() => {
            loadUnreadCount();
        }, 30000);

        return () => {
            clearInterval(interval);
        };
    }, []);


    async function loadUnreadCount() {
        try {
            const response =
                await api.get(
                    "/notifications/unread-count"
                );

            setUnreadCount(
                Number(response.data) || 0
            );

        } catch (err) {
            /*
             * Do not show an error in the navbar.
             *
             * A logged-out user or expired session can
             * legitimately cause this request to fail.
             */
            console.error(
                "Failed to load notification count:",
                err
            );
        }
    }


    /*
     * ============================================================
     * LOAD NOTIFICATIONS
     * ============================================================
     */

    async function loadNotifications() {
        try {
            setLoadingNotifications(true);

            const response =
                await api.get(
                    "/notifications/unread"
                );

            const all =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            // Only the hospital's response — no submission spam.
            const data = all.filter(
                notification =>
                    notification.type ===
                        "BOOKING_APPROVED" ||
                    notification.type ===
                        "BOOKING_REJECTED"
            );

            setNotifications(data);
            setUnreadCount(data.length);

        } catch (err) {
            console.error(
                "Failed to load notifications:",
                err
            );

            setNotifications([]);

        } finally {
            setLoadingNotifications(false);
        }
    }


    /*
     * ============================================================
     * TOGGLE NOTIFICATION DROPDOWN
     * ============================================================
     */

    function handleNotificationToggle() {
        const nextState =
            !showNotifications;

        setShowNotifications(
            nextState
        );

        if (nextState) {
            loadNotifications();
        }
    }


    /*
     * ============================================================
     * MARK ONE AS READ
     * ============================================================
     */

    async function markAsRead(
        notificationId
    ) {
        try {
            await api.patch(
                `/notifications/${notificationId}/read`
            );

            // Disappear after seen.
            setNotifications(
                previous =>
                    previous.filter(
                        notification =>
                            notification.id !==
                            notificationId
                    )
            );

            setUnreadCount(
                previous => Math.max(0, previous - 1)
            );

        } catch (err) {
            console.error(
                "Failed to mark notification as read:",
                err
            );
        }
    }


    /*
     * ============================================================
     * MARK ALL AS READ
     * ============================================================
     */

    async function markAllAsRead() {
        try {
            await api.patch(
                "/notifications/read-all"
            );

            // Disappear after seen — clear all.
            setNotifications([]);
            setUnreadCount(0);

        } catch (err) {
            console.error(
                "Failed to mark all notifications as read:",
                err
            );
        }
    }


    /*
     * ============================================================
     * NOTIFICATION CLICK
     * ============================================================
     */

    async function handleNotificationClick(
        notification
    ) {
        await markAsRead(notification.id);

        if (notification.bookingId) {
            setShowNotifications(false);
            navigate("/bookings");
        }
    }


    /*
     * ============================================================
     * CLOSE DROPDOWN WHEN CLICKING OUTSIDE
     * ============================================================
     */

    useEffect(() => {
        function handleOutsideClick(event) {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target
                )
            ) {
                setShowNotifications(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);


    /*
     * ============================================================
     * LOGOUT
     * ============================================================
     */

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        localStorage.removeItem("name");

        localStorage.removeItem("userToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");

        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("adminEmail");
        localStorage.removeItem("adminName");

        navigate("/login");
    };


    /*
     * ============================================================
     * ACTIVE NAVIGATION
     * ============================================================
     */

    const isActive = (path) => {
        return location.pathname === path;
    };


    /*
     * ============================================================
     * NOTIFICATION ICON
     * ============================================================
     */

    function NotificationIcon() {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9a6 6 0 0 0-12 0v.75a8.967 8.967 0 0 1-2.31 6.022c1.717.547 3.53.94 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
            </svg>
        );
    }


    /*
     * ============================================================
     * NOTIFICATION TYPE
     * ============================================================
     */

    function getNotificationTitle(
        type
    ) {
        if (type === "BOOKING_APPROVED") {
            return "Appointment Approved";
        }

        if (type === "BOOKING_REJECTED") {
            return "Appointment Rejected";
        }

        return "Appointment Update";
    }


    /*
     * ============================================================
     * NOTIFICATION TIME
     * ============================================================
     */

    function formatNotificationTime(
        value
    ) {
        if (!value) {
            return "";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
            }
        );
    }


    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

                {/* Logo */}

                <Link
                    to="/hospitals"
                    className="flex items-center gap-3"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#df7855] text-xl font-bold text-white">
                        M
                    </div>

                    <div>
                        <div className="text-lg font-bold text-gray-900">
                            MediCompare
                        </div>

                        <div className="text-xs text-gray-500">
                            Healthcare comparison
                        </div>
                    </div>
                </Link>


                {/* Navigation */}

                <div className="flex items-center gap-8">

                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`text-sm font-bold transition ${
                                isActive(item.path)
                                    ? "text-[#d86f4e]"
                                    : "text-gray-700 hover:text-[#d86f4e]"
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}


                    {/* ==================================================
                        NOTIFICATIONS
                    ================================================== */}

                    <div
                        ref={notificationRef}
                        className="relative"
                    >

                        <button
                            type="button"
                            onClick={
                                handleNotificationToggle
                            }
                            aria-label="Notifications"
                            className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                showNotifications
                                    ? "bg-[#fdf0eb] text-[#d86f4e]"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-[#d86f4e]"
                            }`}
                        >
                            <NotificationIcon />

                            {unreadCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#d86f4e] px-1 text-[10px] font-bold text-white">
                                    {unreadCount > 99
                                        ? "99+"
                                        : unreadCount}
                                </span>
                            )}

                        </button>


                        {/* ==================================================
                            DROPDOWN
                        ================================================== */}

                        {showNotifications && (
                            <div className="absolute right-0 mt-3 w-[380px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

                                {/* Header */}

                                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">
                                            Notifications
                                        </h3>

                                        <p className="mt-0.5 text-xs text-gray-500">
                                            Stay updated on your appointments
                                        </p>
                                    </div>


                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={
                                                markAllAsRead
                                            }
                                            className="text-xs font-bold text-[#d86f4e] hover:text-[#bd5d3f]"
                                        >
                                            Mark all read
                                        </button>
                                    )}

                                </div>


                                {/* Notification list */}

                                <div className="max-h-[420px] overflow-y-auto">

                                    {loadingNotifications && (
                                        <div className="px-5 py-10 text-center">

                                            <p className="text-sm font-medium text-gray-500">
                                                Loading notifications...
                                            </p>

                                        </div>
                                    )}


                                    {!loadingNotifications &&
                                        notifications.length === 0 && (
                                            <div className="px-5 py-10 text-center">

                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                                                    <NotificationIcon />
                                                </div>

                                                <p className="mt-3 text-sm font-bold text-gray-800">
                                                    No notifications
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    You're all caught up.
                                                </p>

                                            </div>
                                        )}


                                    {!loadingNotifications &&
                                        notifications.map(
                                            notification => (
                                                <button
                                                    key={
                                                        notification.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        handleNotificationClick(
                                                            notification
                                                        )
                                                    }
                                                    className="w-full border-b border-gray-100 bg-[#fffaf7] px-5 py-4 text-left transition hover:bg-gray-50"
                                                >

                                                    <div className="flex gap-3">

                                                        <div
                                                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                                                notification.type ===
                                                                "BOOKING_APPROVED"
                                                                    ? "bg-green-100 text-green-600"
                                                                    : "bg-red-100 text-red-600"
                                                            }`}
                                                        >
                                                            <span className="text-sm font-bold">
                                                                {notification.type ===
                                                                "BOOKING_APPROVED"
                                                                    ? "✓"
                                                                    : "!"}
                                                            </span>
                                                        </div>


                                                        <div className="min-w-0 flex-1">

                                                            <div className="flex items-start justify-between gap-3">

                                                                <p className="text-xs font-bold text-gray-900">
                                                                    {getNotificationTitle(
                                                                        notification.type
                                                                    )}
                                                                </p>

                                                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#d86f4e]" />

                                                            </div>


                                                            <p className="mt-1 text-xs leading-5 text-gray-600">
                                                                {
                                                                    notification.message
                                                                }
                                                            </p>


                                                            <p className="mt-2 text-[10px] font-medium text-gray-400">
                                                                {formatNotificationTime(
                                                                    notification.createdAt
                                                                )}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </button>
                                            )
                                        )}

                                </div>

                            </div>
                        )}

                    </div>


                    {/* Logout */}

                    <button
                        onClick={handleLogout}
                        className="text-sm font-bold text-gray-700 transition hover:text-red-500"
                    >
                        Logout
                    </button>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;