import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/api`;
function AdminDashboard() {

    const navigate = useNavigate();

    const [statistics, setStatistics] = useState({
        hospitals: 0,
        services: 0,
        availableServices: 0,
        prices: 0,
        images: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const adminName =
        localStorage.getItem("name") ||
        localStorage.getItem("adminName") ||
        "Administrator";


    useEffect(() => {
        loadDashboardStatistics();
    }, []);


    async function loadDashboardStatistics() {

        try {

            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("token") ||
                localStorage.getItem("adminToken");

            if (!token) {
                throw new Error(
                    "Admin authentication token is missing."
                );
            }

            const response = await fetch(
                `${API_URL}/admin/dashboard/stats`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            if (!response.ok) {

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    throw new Error(
                        "Admin authentication expired. Please log in again."
                    );
                }

                throw new Error(
                    `Failed to load dashboard statistics (${response.status}).`
                );
            }

            const data =
                await response.json();

            setStatistics({
                hospitals:
                    Number(data.hospitals ?? 0),

                services:
                    Number(data.services ?? 0),

                availableServices:
                    Number(
                        data.availableServices ?? 0
                    ),

                prices:
                    Number(data.prices ?? 0),

                images:
                    Number(data.images ?? 0),
            });

        } catch (err) {

            console.error(
                "Dashboard statistics error:",
                err
            );

            setError(
                err.message ||
                "Unable to load dashboard statistics."
            );

        } finally {

            setLoading(false);

        }
    }


    function logout() {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        localStorage.removeItem("name");

        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("adminEmail");
        localStorage.removeItem("adminName");

        window.location.href =
            "/admin/login";
    }


    const firstLetter =
        adminName
            .charAt(0)
            .toUpperCase();


    return (

        <div className="min-h-screen bg-[#faf9f7] text-ink-900">

            {/* =================================================
                TOP NAVIGATION
            ================================================= */}

            <header className="sticky top-0 z-20 border-b border-ink-200/70 bg-[#faf9f7]/95 backdrop-blur">

                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

                    {/* Brand */}

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin")
                        }
                        className="flex items-center gap-3"
                    >

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-lg font-bold text-white shadow-sm">
                            M
                        </div>

                        <div className="text-left">

                            <div className="text-lg font-semibold tracking-tight text-ink-900">
                                MediCompare
                            </div>

                            <div className="text-xs text-ink-500">
                                Administration
                            </div>

                        </div>

                    </button>


                    {/* Admin profile */}

                    <div className="flex items-center gap-4">

                        <div className="hidden text-right sm:block">

                            <p className="text-sm font-semibold text-ink-900">
                                {adminName}
                            </p>

                            <p className="text-xs text-ink-500">
                                Administrator
                            </p>

                        </div>


                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">
                            {firstLetter}
                        </div>


                        <button
                            type="button"
                            onClick={logout}
                            className="rounded-xl border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium text-ink-700 transition hover:border-ink-300 hover:bg-ink-100"
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="mx-auto max-w-7xl px-6 py-10">

                {/* Greeting */}

                <section className="mb-10">

                    <p className="mb-3 text-sm font-medium text-brand-600">
                        Good morning
                    </p>

                    <h2 className="text-4xl font-semibold tracking-tight text-ink-900">
                        Welcome back, {adminName}.
                    </h2>

                    <p className="mt-3 max-w-2xl text-base leading-7 text-ink-500">
                        Manage hospitals, healthcare services,
                        pricing, images and appointment bookings
                        from one place.
                    </p>

                </section>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="mb-8 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={
                                loadDashboardStatistics
                            }
                            className="font-semibold underline"
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <StatCard
                        label="Hospitals"
                        value={
                            loading
                                ? "..."
                                : statistics.hospitals
                        }
                        description="Registered hospitals"
                    />


                    <StatCard
                        label="Services"
                        value={
                            loading
                                ? "..."
                                : statistics.services
                        }
                        description={
                            loading
                                ? "Loading services"
                                : `${statistics.availableServices} available services`
                        }
                    />


                    <StatCard
                        label="Prices"
                        value={
                            loading
                                ? "..."
                                : statistics.prices
                        }
                        description="Service prices"
                    />


                    <StatCard
                        label="Images"
                        value={
                            loading
                                ? "..."
                                : statistics.images
                        }
                        description="Hospital images"
                    />

                </section>


                {/* =================================================
                    MANAGEMENT
                ================================================= */}

                <section className="mt-10">

                    <div className="mb-5">

                        <h3 className="text-xl font-semibold">
                            Management
                        </h3>

                        <p className="mt-1 text-sm text-ink-500">
                            Manage the information and appointment
                            activity for MediCompare users.
                        </p>

                    </div>


                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">


                        {/* Hospitals */}

                        <ManagementCard
                            title="Hospitals"
                            description="Add, edit, remove and manage hospitals."
                            icon="🏥"
                            onClick={() =>
                                navigate(
                                    "/admin/hospitals"
                                )
                            }
                        />


                        {/* Services */}

                        <ManagementCard
                            title="Services"
                            description="Manage healthcare services and individual prices for each hospital."
                            icon="✚"
                            onClick={() =>
                                navigate(
                                    "/admin/services"
                                )
                            }
                        />


                        {/* Prices */}

                        <ManagementCard
                            title="Prices"
                            description="Manage and compare service pricing."
                            icon="₹"
                            onClick={() =>
                                navigate(
                                    "/admin/services"
                                )
                            }
                        />


                        {/* Bookings */}

                        <ManagementCard
                            title="Bookings"
                            description="Review appointment requests and approve or reject bookings."
                            icon="📅"
                            onClick={() =>
                                navigate(
                                    "/admin/bookings"
                                )
                            }
                        />

                    </div>

                </section>


                {/* =================================================
                    BOOKING QUICK ACTION
                ================================================= */}

                <section className="mt-10 rounded-2xl border border-brand-200 bg-brand-50 p-7">

                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                        <div>

                            <p className="text-sm font-semibold text-brand-600">
                                Appointment management
                            </p>

                            <h3 className="mt-1 text-xl font-semibold">
                                Review patient bookings
                            </h3>

                            <p className="mt-1 text-sm text-ink-500">
                                Review pending appointment requests
                                and decide whether to approve or reject them.
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/bookings"
                                )
                            }
                            className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-[0.98]"
                        >
                            View Bookings →
                        </button>

                    </div>

                </section>


                {/* =================================================
                    HOSPITAL QUICK ACTION
                ================================================= */}

                <section className="mt-5 rounded-2xl border border-ink-200 bg-white p-7">

                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                        <div>

                            <p className="text-sm font-medium text-brand-600">
                                Quick action
                            </p>

                            <h3 className="mt-1 text-xl font-semibold">
                                Add a new hospital
                            </h3>

                            <p className="mt-1 text-sm text-ink-500">
                                Start adding hospitals and their services.
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/hospitals/add"
                                )
                            }
                            className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-[0.98]"
                        >
                            + Add Hospital
                        </button>

                    </div>

                </section>

            </main>

        </div>
    );
}


/* =============================================================
   STAT CARD
============================================================= */

function StatCard({
    label,
    value,
    description,
}) {

    return (

        <div className="rounded-2xl border border-ink-200 bg-white p-6 transition hover:border-ink-300">

            <p className="text-sm text-ink-500">
                {label}
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
                {value}
            </p>

            <p className="mt-2 text-xs text-ink-400">
                {description}
            </p>

        </div>

    );
}


/* =============================================================
   MANAGEMENT CARD
============================================================= */

function ManagementCard({
    title,
    description,
    icon,
    onClick,
}) {

    return (

        <button
            type="button"
            onClick={onClick}
            className="group rounded-2xl border border-ink-200 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-md"
        >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-xl transition group-hover:bg-brand-200">
                {icon}
            </div>


            <h4 className="mt-5 text-lg font-semibold text-ink-900">
                {title}
            </h4>


            <p className="mt-2 text-sm leading-6 text-ink-500">
                {description}
            </p>


            <div className="mt-5 text-sm font-semibold text-brand-600">
                Manage →
            </div>

        </button>

    );

}


export default AdminDashboard;