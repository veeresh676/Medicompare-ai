import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/api`;

const AdminBookings = () => {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");

    const adminToken =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token");

    const getBookings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/admin/bookings`,
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                    },
                }
            );

            setBookings(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error("Failed to load bookings:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load bookings."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getBookings();
    }, []);

    const updateBookingStatus = async (bookingId, action) => {
        try {
            setActionLoading(`${bookingId}-${action}`);
            setError("");

            await axios.patch(
                `${API_URL}/admin/bookings/${bookingId}/${action}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                    },
                }
            );

            await getBookings();
        } catch (err) {
            console.error("Failed to update booking:", err);

            setError(
                err.response?.data?.message ||
                `Unable to ${action} booking.`
            );
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return "Not available";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (time) => {
        if (!time) return "Not available";

        const parts = time.split(":");

        if (parts.length < 2) {
            return time;
        }

        const hours = Number(parts[0]);
        const minutes = parts[1];

        const suffix = hours >= 12 ? "PM" : "AM";
        const displayHour = hours % 12 || 12;

        return `${displayHour}:${minutes} ${suffix}`;
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "PENDING":
                return "bg-amber-100 text-amber-700";

            case "APPROVED":
                return "bg-green-100 text-green-700";

            case "REJECTED":
                return "bg-red-100 text-red-700";

            case "CANCELLED":
                return "bg-gray-100 text-gray-600";

            case "COMPLETED":
                return "bg-blue-100 text-blue-700";

            case "CONFIRMED":
                return "bg-gray-100 text-gray-700";

            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const filteredBookings =
        filter === "ALL"
            ? bookings
            : bookings.filter(
                  (booking) => booking.status === filter
              );

    const filterButtons = [
        "ALL",
        "PENDING",
        "APPROVED",
        "REJECTED",
        "COMPLETED",
        "CANCELLED",
    ];

    return (
        <div className="min-h-screen bg-[#faf9f7]">

            {/* Admin Header */}
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Booking Management
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Review and manage patient appointment requests.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">

                        <button
                            onClick={() => navigate("/admin")}
                            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-[#df7855] hover:text-[#df7855]"
                        >
                            Dashboard
                        </button>

                        <button
                            onClick={() => {
                                localStorage.removeItem("adminToken");
                                localStorage.removeItem("adminRole");
                                localStorage.removeItem("adminEmail");
                                localStorage.removeItem("adminName");

                                navigate("/admin/login");
                            }}
                            className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-gray-700"
                        >
                            Logout
                        </button>

                    </div>
                </div>
            </header>


            <main className="mx-auto max-w-7xl px-6 py-10">

                {/* Filters */}
                <div className="mb-8 flex flex-wrap gap-3">

                    {filterButtons.map((item) => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                                filter === item
                                    ? "bg-[#df7855] text-white"
                                    : "border border-gray-300 bg-white text-gray-700 hover:border-[#df7855] hover:text-[#df7855]"
                            }`}
                        >
                            {item}
                        </button>
                    ))}

                </div>


                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                        {error}
                    </div>
                )}


                {/* Loading */}
                {loading && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">

                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#df7855]"></div>

                        <p className="text-gray-600">
                            Loading bookings...
                        </p>

                    </div>
                )}


                {/* No bookings */}
                {!loading && filteredBookings.length === 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">

                        <h2 className="text-xl font-bold text-gray-900">
                            No bookings found
                        </h2>

                        <p className="mt-2 text-gray-500">
                            There are no bookings matching the selected filter.
                        </p>

                    </div>
                )}


                {/* Bookings */}
                {!loading && filteredBookings.length > 0 && (
                    <div className="space-y-5">

                        {filteredBookings.map((booking) => {

                            const approveLoading =
                                actionLoading ===
                                `${booking.id}-approve`;

                            const rejectLoading =
                                actionLoading ===
                                `${booking.id}-reject`;

                            /*
                             * PENDING bookings are the normal
                             * approval workflow.
                             *
                             * CONFIRMED is included temporarily
                             * so older bookings in the database
                             * can still be managed by the admin.
                             */
                            const canManage =
                                booking.status === "PENDING" ||
                                booking.status === "CONFIRMED";

                            return (
                                <div
                                    key={booking.id}
                                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                                >

                                    {/* Booking Header */}
                                    <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">

                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                Booking
                                            </p>

                                            <h2 className="mt-1 text-2xl font-bold text-gray-900">
                                                #{booking.id}
                                            </h2>
                                        </div>


                                        <div className="flex items-center gap-3">

                                            <span
                                                className={`rounded-full px-4 py-2 text-xs font-bold tracking-wide ${getStatusClass(
                                                    booking.status
                                                )}`}
                                            >
                                                {booking.status || "UNKNOWN"}
                                            </span>

                                        </div>

                                    </div>


                                    {/* Patient + Booking Information */}
                                    <div className="grid gap-7 px-6 py-6 md:grid-cols-2 lg:grid-cols-4">

                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                Patient
                                            </p>

                                            <p className="mt-2 font-bold text-gray-900">
                                                {booking.userName ||
                                                    "Not available"}
                                            </p>

                                            {booking.userEmail && (
                                                <p className="mt-1 break-all text-sm text-gray-500">
                                                    {booking.userEmail}
                                                </p>
                                            )}
                                        </div>


                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                Hospital
                                            </p>

                                            <p className="mt-2 font-semibold text-gray-900">
                                                {booking.hospitalName ||
                                                    "Not available"}
                                            </p>
                                        </div>


                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                Service
                                            </p>

                                            <p className="mt-2 font-semibold text-gray-900">
                                                {booking.serviceName ||
                                                    "Not available"}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                ₹
                                                {booking.servicePrice ??
                                                    booking.price ??
                                                    "0"}
                                            </p>
                                        </div>


                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                Appointment
                                            </p>

                                            <p className="mt-2 font-semibold text-gray-900">
                                                {formatDate(
                                                    booking.appointmentDate
                                                )}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {formatTime(
                                                    booking.appointmentTime
                                                )}
                                            </p>
                                        </div>

                                    </div>


                                    {/* Notes */}
                                    {booking.notes && (
                                        <div className="px-6 pb-6">

                                            <div className="rounded-xl bg-gray-50 p-4">

                                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                    Patient Notes
                                                </p>

                                                <p className="mt-2 text-sm leading-6 text-gray-700">
                                                    {booking.notes}
                                                </p>

                                            </div>

                                        </div>
                                    )}


                                    {/* Admin Actions */}
                                    <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                                        <div>

                                            {booking.status === "PENDING" && (
                                                <>
                                                    <p className="font-bold text-gray-900">
                                                        Action required
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Review this appointment request.
                                                    </p>
                                                </>
                                            )}

                                            {booking.status === "APPROVED" && (
                                                <>
                                                    <p className="font-bold text-green-700">
                                                        Appointment approved
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        The requested slot is confirmed.
                                                    </p>
                                                </>
                                            )}

                                            {booking.status === "REJECTED" && (
                                                <>
                                                    <p className="font-bold text-red-700">
                                                        Appointment rejected
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        The requested appointment was not accepted.
                                                    </p>
                                                </>
                                            )}

                                            {booking.status === "CANCELLED" && (
                                                <p className="font-medium text-gray-500">
                                                    This booking was cancelled.
                                                </p>
                                            )}

                                            {booking.status === "COMPLETED" && (
                                                <p className="font-medium text-blue-700">
                                                    This appointment has been completed.
                                                </p>
                                            )}

                                            {booking.status === "CONFIRMED" && (
                                                <>
                                                    <p className="font-bold text-gray-900">
                                                        Legacy booking
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        You can approve or reject this older booking.
                                                    </p>
                                                </>
                                            )}

                                        </div>


                                        {canManage && (
                                            <div className="flex gap-3">

                                                <button
                                                    onClick={() =>
                                                        updateBookingStatus(
                                                            booking.id,
                                                            "reject"
                                                        )
                                                    }
                                                    disabled={
                                                        approveLoading ||
                                                        rejectLoading
                                                    }
                                                    className="rounded-xl border border-red-300 bg-white px-6 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {rejectLoading
                                                        ? "Rejecting..."
                                                        : "Reject"}
                                                </button>


                                                <button
                                                    onClick={() =>
                                                        updateBookingStatus(
                                                            booking.id,
                                                            "approve"
                                                        )
                                                    }
                                                    disabled={
                                                        approveLoading ||
                                                        rejectLoading
                                                    }
                                                    className="rounded-xl bg-[#df7855] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#cc6848] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {approveLoading
                                                        ? "Approving..."
                                                        : "Approve"}
                                                </button>

                                            </div>
                                        )}

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </main>
        </div>
    );
};

export default AdminBookings;