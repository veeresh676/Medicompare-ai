import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/api`;
const BookingStatus = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("userToken");

    const getBookings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(`${API_URL}/bookings`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setBookings(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error("Failed to load bookings:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load your bookings."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getBookings();
    }, []);

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

            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const getStatusMessage = (status) => {
        switch (status) {
            case "PENDING":
                return "Your appointment request is waiting for hospital approval.";

            case "APPROVED":
                return "Your appointment has been approved and the slot is confirmed.";

            case "REJECTED":
                return "Your appointment request was rejected. The requested slot may not be available.";

            case "CANCELLED":
                return "This appointment has been cancelled.";

            case "COMPLETED":
                return "This appointment has been completed.";

            default:
                return "Booking status is currently unavailable.";
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

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#faf9f7] px-6 py-12">
                <div className="mx-auto max-w-6xl">

                    {/* Header */}
                    <div className="mb-10">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                                    My Bookings
                                </h1>

                                <p className="mt-2 text-base text-gray-600">
                                    Track the status of all your appointment requests.
                                </p>
                            </div>

                            <button
                                onClick={getBookings}
                                disabled={loading}
                                className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:border-[#df7855] hover:text-[#df7855] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? "Refreshing..." : "Refresh Status"}
                            </button>
                        </div>
                    </div>


                    {/* Loading */}
                    {loading && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#df7855]"></div>

                            <p className="text-gray-600">
                                Loading your bookings...
                            </p>
                        </div>
                    )}


                    {/* Error */}
                    {!loading && error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                            <h2 className="font-bold text-red-700">
                                Unable to load bookings
                            </h2>

                            <p className="mt-2 text-sm text-red-600">
                                {error}
                            </p>

                            <button
                                onClick={getBookings}
                                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                            >
                                Try Again
                            </button>
                        </div>
                    )}


                    {/* No bookings */}
                    {!loading && !error && bookings.length === 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1eb] text-2xl">
                                📅
                            </div>

                            <h2 className="mt-5 text-2xl font-bold text-gray-900">
                                No bookings yet
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-gray-600">
                                You haven't requested any appointments yet.
                                Visit a hospital and request an appointment to see it here.
                            </p>
                        </div>
                    )}


                    {/* Booking list */}
                    {!loading && !error && bookings.length > 0 && (
                        <div className="space-y-6">

                            {bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                                >

                                    {/* Top section */}
                                    <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                Booking
                                            </p>

                                            <h2 className="mt-1 text-xl font-bold text-gray-900">
                                                #{booking.id}
                                            </h2>
                                        </div>

                                        <span
                                            className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-xs font-bold tracking-wide ${getStatusClass(
                                                booking.status
                                            )}`}
                                        >
                                            {booking.status || "UNKNOWN"}
                                        </span>

                                    </div>


                                    {/* Booking details */}
                                    <div className="grid gap-6 px-6 py-6 md:grid-cols-2 lg:grid-cols-4">

                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                Hospital
                                            </p>

                                            <p className="mt-2 font-semibold text-gray-900">
                                                {booking.hospitalName || "Not available"}
                                            </p>
                                        </div>


                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                Service
                                            </p>

                                            <p className="mt-2 font-semibold text-gray-900">
                                                {booking.serviceName || "Not available"}
                                            </p>
                                        </div>


                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                Appointment Date
                                            </p>

                                            <p className="mt-2 font-semibold text-gray-900">
                                                {formatDate(booking.appointmentDate)}
                                            </p>
                                        </div>


                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                Appointment Time
                                            </p>

                                            <p className="mt-2 font-semibold text-gray-900">
                                                {formatTime(booking.appointmentTime)}
                                            </p>
                                        </div>

                                    </div>


                                    {/* Price */}
                                    <div className="px-6 pb-5">
                                        <div className="inline-flex rounded-xl bg-gray-50 px-4 py-3">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                    Service Price
                                                </p>

                                                <p className="mt-1 text-lg font-bold text-gray-900">
                                                    ₹
                                                    {booking.servicePrice ??
                                                        booking.price ??
                                                        "0"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>


                                    {/* Status message */}
                                    <div className="px-6 pb-6">
                                        <div
                                            className={`rounded-xl p-4 ${
                                                booking.status === "APPROVED"
                                                    ? "bg-green-50"
                                                    : booking.status === "REJECTED"
                                                    ? "bg-red-50"
                                                    : booking.status === "PENDING"
                                                    ? "bg-amber-50"
                                                    : "bg-gray-50"
                                            }`}
                                        >
                                            <p
                                                className={`text-sm font-medium ${
                                                    booking.status === "APPROVED"
                                                        ? "text-green-700"
                                                        : booking.status === "REJECTED"
                                                        ? "text-red-700"
                                                        : booking.status === "PENDING"
                                                        ? "text-amber-700"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {getStatusMessage(
                                                    booking.status
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            ))}

                        </div>
                    )}

                </div>
            </main>
        </>
    );
};

export default BookingStatus;