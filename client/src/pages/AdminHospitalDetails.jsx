import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL as API_URL } from "../config";
const EMPTY_SERVICE = {
    name: "",
    description: "",
    price: "",
    category: "",
    durationMinutes: "",
    available: true,
};

function AdminHospitalDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [hospital, setHospital] = useState(null);
    const [services, setServices] = useState([]);

    const [loading, setLoading] = useState(true);
    const [servicesLoading, setServicesLoading] =
        useState(true);

    const [error, setError] = useState("");
    const [serviceError, setServiceError] = useState("");

    const [showServiceModal, setShowServiceModal] =
        useState(false);

    const [editingServiceId, setEditingServiceId] =
        useState(null);

    const [serviceForm, setServiceForm] =
        useState({
            ...EMPTY_SERVICE,
        });

    const [savingService, setSavingService] =
        useState(false);

    useEffect(() => {
        loadHospital();
        loadServices();
    }, [id]);

    async function loadHospital() {

        try {

            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("token") || localStorage.getItem("adminToken");

            const response = await fetch(
                `${API_URL}/api/admin/hospitals/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    throw new Error(
                        "Admin authentication expired."
                    );
                }

                if (response.status === 404) {
                    throw new Error(
                        "Hospital not found."
                    );
                }

                throw new Error(
                    "Unable to load hospital."
                );
            }

            const data =
                await response.json();

            setHospital(data);

        } catch (err) {

            console.error(
                "Failed to load hospital:",
                err
            );

            setError(
                err.message ||
                "Unable to load hospital."
            );

        } finally {

            setLoading(false);
        }
    }

    async function loadServices() {

        try {

            setServicesLoading(true);
            setServiceError("");

            const token =
                localStorage.getItem("token") || localStorage.getItem("adminToken");

            const response = await fetch(
                `${API_URL}/api/admin/hospitals/${id}/services`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    throw new Error(
                        "Admin authentication expired."
                    );
                }

                throw new Error(
                    "Unable to load services."
                );
            }

            const data =
                await response.json();

            setServices(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Failed to load services:",
                err
            );

            setServiceError(
                err.message ||
                "Unable to load services."
            );

        } finally {

            setServicesLoading(false);
        }
    }

    function handleServiceChange(event) {

        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setServiceForm(previous => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    }

    function openAddServiceModal() {

        setEditingServiceId(null);

        setServiceForm({
            ...EMPTY_SERVICE,
        });

        setServiceError("");

        setShowServiceModal(true);
    }

    function openEditServiceModal(service) {

        setEditingServiceId(
            service.id
        );

        setServiceForm({
            name:
                service.name || "",

            description:
                service.description || "",

            price:
                service.price ?? "",

            category:
                service.category || "",

            durationMinutes:
                service.durationMinutes ?? "",

            available:
                service.available !== false,
        });

        setServiceError("");

        setShowServiceModal(true);
    }

    function closeServiceModal() {

        if (savingService) {
            return;
        }

        setShowServiceModal(false);

        setEditingServiceId(null);

        setServiceForm({
            ...EMPTY_SERVICE,
        });
    }

    async function saveService() {

        setServiceError("");

        const name =
            serviceForm.name.trim();

        if (!name) {

            setServiceError(
                "Service name is required."
            );

            return;
        }

        if (
            serviceForm.price === "" ||
            Number.isNaN(
                Number(serviceForm.price)
            ) ||
            Number(serviceForm.price) < 0
        ) {

            setServiceError(
                "Please enter a valid price."
            );

            return;
        }

        if (
            serviceForm.durationMinutes !== "" &&
            (
                Number.isNaN(
                    Number(
                        serviceForm.durationMinutes
                    )
                ) ||
                Number(
                    serviceForm.durationMinutes
                ) <= 0
            )
        ) {

            setServiceError(
                "Duration must be greater than zero."
            );

            return;
        }

        try {

            setSavingService(true);

            const token =
                localStorage.getItem("token") || localStorage.getItem("adminToken");

            const payload = {

                name,

                description:
                    serviceForm.description.trim() ||
                    null,

                price:
                    Number(
                        serviceForm.price
                    ),

                category:
                    serviceForm.category.trim() ||
                    null,

                durationMinutes:
                    serviceForm.durationMinutes === ""
                        ? null
                        : Number(
                            serviceForm.durationMinutes
                        ),

                available:
                    serviceForm.available,
            };

            const isEditing =
                editingServiceId !== null;

            const url =
                isEditing
                    ? `${API_URL}/api/admin/hospitals/${id}/services/${editingServiceId}`
                    : `${API_URL}/api/admin/hospitals/${id}/services`;

            const response =
                await fetch(
                    url,
                    {
                        method:
                            isEditing
                                ? "PUT"
                                : "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,
                        },

                        body:
                            JSON.stringify(
                                payload
                            ),
                    }
                );

            if (!response.ok) {

                const message =
                    await response.text();

                throw new Error(
                    message ||
                    `Unable to ${
                        isEditing
                            ? "update"
                            : "create"
                    } service.`
                );
            }

            const savedService =
                await response.json();

            if (isEditing) {

                setServices(
                    previous =>
                        previous.map(
                            service =>
                                service.id ===
                                editingServiceId
                                    ? savedService
                                    : service
                        )
                );

            } else {

                setServices(
                    previous => [
                        ...previous,
                        savedService,
                    ]
                );
            }

            closeServiceModal();

        } catch (err) {

            console.error(
                "Failed to save service:",
                err
            );

            setServiceError(
                err.message ||
                "Unable to save service."
            );

        } finally {

            setSavingService(false);
        }
    }

    async function deleteService(
        serviceId
    ) {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this service?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setServiceError("");

            const token =
                localStorage.getItem("token") || localStorage.getItem("adminToken");

            const response =
                await fetch(
                    `${API_URL}/api/admin/hospitals/${id}/services/${serviceId}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            if (!response.ok) {

                throw new Error(
                    "Unable to delete service."
                );
            }

            setServices(
                previous =>
                    previous.filter(
                        service =>
                            service.id !==
                            serviceId
                    )
            );

        } catch (err) {

            console.error(
                "Delete service failed:",
                err
            );

            setServiceError(
                err.message ||
                "Unable to delete service."
            );
        }
    }

    async function deleteHospital() {

        const confirmed =
            window.confirm(
                `Delete ${hospital?.name || "this hospital"}? This cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            const token =
                localStorage.getItem("token") || localStorage.getItem("adminToken");

            const response =
                await fetch(
                    `${API_URL}/api/admin/hospitals/${id}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            if (!response.ok) {

                throw new Error(
                    "Unable to delete hospital."
                );
            }

            navigate(
                "/admin/hospitals"
            );

        } catch (err) {

            console.error(
                "Delete hospital failed:",
                err
            );

            setError(
                err.message ||
                "Unable to delete hospital."
            );
        }
    }

    function logout() {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        localStorage.removeItem("name");

        localStorage.removeItem("userToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");

        navigate(
            "/admin/login",
            {
                replace: true,
            }
        );
    }

    if (loading) {

        return (
            <AdminShell
                navigate={navigate}
                logout={logout}
            >
                <LoadingState />
            </AdminShell>
        );
    }

    if (error || !hospital) {

        return (
            <AdminShell
                navigate={navigate}
                logout={logout}
            >

                <div className="rounded-3xl border border-red-200 bg-red-50 p-12 text-center">

                    <div className="text-4xl">
                        ⚠️
                    </div>

                    <h1 className="mt-4 text-2xl font-semibold text-red-900">
                        Hospital unavailable
                    </h1>

                    <p className="mt-2 text-sm text-red-700">
                        {error ||
                            "The hospital could not be found."}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/hospitals"
                            )
                        }
                        className="mt-6 rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white"
                    >
                        Back to Hospitals
                    </button>

                </div>

            </AdminShell>
        );
    }

    return (

        <AdminShell
            navigate={navigate}
            logout={logout}
        >

            {/* =================================================
                BACK
            ================================================= */}

            <button
                type="button"
                onClick={() =>
                    navigate(
                        "/admin/hospitals"
                    )
                }
                className="mb-6 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
                ← Back to Hospitals
            </button>


            {/* =================================================
                HOSPITAL HEADER
            ================================================= */}

            <section className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-sm">

                <div className="grid lg:grid-cols-[360px_1fr]">

                    <div className="h-72 bg-ink-100 lg:h-full">

                        {hospital.imageUrl ? (

                            <img
                                src={
                                    hospital.imageUrl
                                }
                                alt={
                                    hospital.name
                                }
                                className="h-full w-full object-cover"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                onError={(event) => {
                                    event.currentTarget.style.display =
                                        "none";
                                }}
                            />

                        ) : (

                            <div className="flex h-full items-center justify-center text-7xl">
                                🏥
                            </div>

                        )}

                    </div>

                    <div className="p-8 lg:p-10">

                        <div className="flex flex-col justify-between gap-6 sm:flex-row">

                            <div>

                                <span className="inline-flex rounded-full bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700">
                                    Admin Hospital Management
                                </span>

                                <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                                    {hospital.name}
                                </h1>

                                <p className="mt-2 text-lg text-ink-500">
                                    {hospital.city}
                                </p>

                            </div>

                            <div className="flex gap-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/admin/hospitals/${id}/edit`
                                        )
                                    }
                                    className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600"
                                >
                                    Edit Hospital
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        deleteHospital
                                    }
                                    className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">

                            <InfoCard
                                label="City"
                                value={
                                    hospital.city
                                }
                            />

                            <InfoCard
                                label="Hospital Type"
                                value={
                                    hospital.hospitalType
                                }
                            />

                            <InfoCard
                                label="Consultation Fee"
                                value={
                                    hospital.consultationFee !=
                                    null
                                        ? `₹${hospital.consultationFee}`
                                        : "Not specified"
                                }
                            />

                            <InfoCard
                                label="Rating"
                                value={
                                    hospital.rating !=
                                    null
                                        ? `★ ${hospital.rating}`
                                        : "Not rated"
                                }
                            />

                            <InfoCard
                                label="Phone"
                                value={
                                    hospital.phoneNumber
                                }
                            />

                            <InfoCard
                                label="Location"
                                value={
                                    hospital.location
                                }
                            />

                        </div>

                    </div>

                </div>

                {hospital.description && (

                    <div className="border-t border-ink-100 p-8">

                        <p className="text-sm font-semibold text-ink-900">
                            Description
                        </p>

                        <p className="mt-2 max-w-4xl text-sm leading-7 text-ink-500">
                            {hospital.description}
                        </p>

                    </div>

                )}

            </section>


            {/* =================================================
                SERVICES
            ================================================= */}

            <section className="mt-10">

                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                    <div>

                        <span className="text-sm font-semibold text-brand-600">
                            Healthcare Services
                        </span>

                        <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                            Services & Pricing
                        </h2>

                        <p className="mt-2 text-sm text-ink-500">
                            Edit service names, prices,
                            duration and availability.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={
                            openAddServiceModal
                        }
                        className="rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white hover:bg-ink-800"
                    >
                        + Add Service
                    </button>

                </div>


                {serviceError && (

                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                        {serviceError}
                    </div>

                )}


                {servicesLoading ? (

                    <LoadingState />

                ) : services.length === 0 ? (

                    <div className="rounded-3xl border border-dashed border-ink-300 bg-white p-12 text-center">

                        <div className="text-4xl">
                            ✚
                        </div>

                        <h3 className="mt-4 text-xl font-semibold">
                            No services
                        </h3>

                        <p className="mt-2 text-sm text-ink-500">
                            Add the first healthcare
                            service for this hospital.
                        </p>

                    </div>

                ) : (

                    <div className="grid gap-5 lg:grid-cols-2">

                        {services.map(
                            service => (

                                <article
                                    key={
                                        service.id
                                    }
                                    className="rounded-3xl border border-ink-200 bg-white p-6 shadow-sm transition hover:border-ink-300 hover:shadow-md"
                                >

                                    <div className="flex items-start justify-between gap-5">

                                        <div className="min-w-0">

                                            <div className="flex flex-wrap items-center gap-2">

                                                <h3 className="text-xl font-semibold">
                                                    {
                                                        service.name
                                                    }
                                                </h3>

                                                <span
                                                    className={
                                                        service.available !== false
                                                            ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700"
                                                            : "rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700"
                                                    }
                                                >
                                                    {
                                                        service.available !== false
                                                            ? "Available"
                                                            : "Unavailable"
                                                    }
                                                </span>

                                            </div>

                                            {service.category && (

                                                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
                                                    {
                                                        service.category
                                                    }
                                                </p>

                                            )}

                                        </div>

                                        <div className="shrink-0 text-right">

                                            <p className="text-xs text-ink-500">
                                                Price
                                            </p>

                                            <p className="mt-1 text-2xl font-semibold text-brand-600">
                                                ₹
                                                {
                                                    service.price ??
                                                    "—"
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    {service.description && (

                                        <p className="mt-5 text-sm leading-6 text-ink-500">
                                            {
                                                service.description
                                            }
                                        </p>

                                    )}


                                    <div className="mt-5 grid grid-cols-2 gap-3">

                                        <InfoCard
                                            label="Duration"
                                            value={
                                                service.durationMinutes
                                                    ? `${service.durationMinutes} min`
                                                    : "Not specified"
                                            }
                                        />

                                        <InfoCard
                                            label="Availability"
                                            value={
                                                service.available !==
                                                false
                                                    ? "Available"
                                                    : "Unavailable"
                                            }
                                        />

                                    </div>


                                    <div className="mt-5 flex gap-3 border-t border-ink-100 pt-5">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEditServiceModal(
                                                    service
                                                )
                                            }
                                            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
                                        >
                                            Edit Service
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteService(
                                                    service.id
                                                )
                                            }
                                            className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </article>
                            )
                        )}

                    </div>
                )}

            </section>


            {/* =================================================
                SERVICE MODAL
            ================================================= */}

            {showServiceModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm">

                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-ink-200 bg-white shadow-2xl">

                        <div className="flex items-start justify-between border-b border-ink-200 px-7 py-6">

                            <div>

                                <p className="text-sm font-semibold text-brand-600">
                                    Service Management
                                </p>

                                <h2 className="mt-1 text-2xl font-semibold">
                                    {editingServiceId !== null
                                        ? "Edit Service"
                                        : "Add Service"}
                                </h2>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeServiceModal
                                }
                                disabled={
                                    savingService
                                }
                                className="rounded-xl px-3 py-2 text-ink-500 hover:bg-ink-100 disabled:opacity-50"
                            >
                                ✕
                            </button>

                        </div>


                        <div className="space-y-5 p-7">

                            {serviceError && (

                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {serviceError}
                                </div>

                            )}


                            <div>

                                <label className="mb-2 block text-sm font-semibold">
                                    Service Name *
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={
                                        serviceForm.name
                                    }
                                    onChange={
                                        handleServiceChange
                                    }
                                    placeholder="Cardiology Consultation"
                                    className="h-12 w-full rounded-xl border border-ink-200 px-4 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                                />

                            </div>


                            <div className="grid gap-5 sm:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold">
                                        Price *
                                    </label>

                                    <div className="relative">

                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500">
                                            ₹
                                        </span>

                                        <input
                                            type="number"
                                            name="price"
                                            min="0"
                                            step="0.01"
                                            value={
                                                serviceForm.price
                                            }
                                            onChange={
                                                handleServiceChange
                                            }
                                            className="h-12 w-full rounded-xl border border-ink-200 pl-9 pr-4 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                                        />

                                    </div>

                                </div>


                                <div>

                                    <label className="mb-2 block text-sm font-semibold">
                                        Duration
                                    </label>

                                    <div className="relative">

                                        <input
                                            type="number"
                                            name="durationMinutes"
                                            min="1"
                                            value={
                                                serviceForm.durationMinutes
                                            }
                                            onChange={
                                                handleServiceChange
                                            }
                                            className="h-12 w-full rounded-xl border border-ink-200 px-4 pr-16 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                                        />

                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-500">
                                            min
                                        </span>

                                    </div>

                                </div>

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-semibold">
                                    Category
                                </label>

                                <input
                                    type="text"
                                    name="category"
                                    value={
                                        serviceForm.category
                                    }
                                    onChange={
                                        handleServiceChange
                                    }
                                    placeholder="Cardiology"
                                    className="h-12 w-full rounded-xl border border-ink-200 px-4 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                                />

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-semibold">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        serviceForm.description
                                    }
                                    onChange={
                                        handleServiceChange
                                    }
                                    rows="4"
                                    placeholder="Describe this healthcare service..."
                                    className="w-full resize-none rounded-xl border border-ink-200 px-4 py-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                                />

                            </div>


                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-200 p-4">

                                <input
                                    type="checkbox"
                                    name="available"
                                    checked={
                                        serviceForm.available
                                    }
                                    onChange={
                                        handleServiceChange
                                    }
                                    className="h-5 w-5 accent-brand-500"
                                />

                                <span>

                                    <span className="block text-sm font-semibold">
                                        Service available
                                    </span>

                                    <span className="block text-xs text-ink-500">
                                        Users can book this service when enabled.
                                    </span>

                                </span>

                            </label>


                            <div className="flex justify-end gap-3 border-t border-ink-100 pt-5">

                                <button
                                    type="button"
                                    onClick={
                                        closeServiceModal
                                    }
                                    disabled={
                                        savingService
                                    }
                                    className="rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-100 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        saveService
                                    }
                                    disabled={
                                        savingService
                                    }
                                    className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {savingService
                                        ? "Saving..."
                                        : editingServiceId !== null
                                            ? "Save Changes"
                                            : "Add Service"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}

        </AdminShell>
    );
}


/* =============================================================
   ADMIN SHELL
============================================================= */

function AdminShell({
    children,
    navigate,
    logout,
}) {

    const name =
        localStorage.getItem("name") ||
        "Administrator";

    const initial =
        name
            .charAt(0)
            .toUpperCase();

    return (

        <div className="min-h-screen bg-ink-50 text-ink-900">

            <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-ink-50/95 backdrop-blur-xl">

                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin")
                        }
                        className="flex items-center gap-3"
                    >

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-lg font-bold text-white">
                            M
                        </div>

                        <div className="text-left">

                            <p className="text-lg font-semibold tracking-tight">
                                MediCompare
                            </p>

                            <p className="text-xs text-ink-500">
                                Administration
                            </p>

                        </div>

                    </button>


                    <div className="flex items-center gap-4">

                        <div className="hidden text-right sm:block">

                            <p className="text-sm font-semibold">
                                {name}
                            </p>

                            <p className="text-xs text-ink-500">
                                Administrator
                            </p>

                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">
                            {initial}
                        </div>

                        <button
                            type="button"
                            onClick={logout}
                            className="rounded-xl border border-ink-200 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-ink-100"
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </header>

            <main className="mx-auto max-w-7xl px-6 py-10">

                {children}

            </main>

        </div>
    );
}


/* =============================================================
   LOADING
============================================================= */

function LoadingState() {

    return (

        <div className="rounded-3xl border border-ink-200 bg-white p-16 text-center shadow-sm">

            <div className="mx-auto mb-5 h-9 w-9 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />

            <p className="text-sm text-ink-500">
                Loading...
            </p>

        </div>
    );
}


/* =============================================================
   INFO CARD
============================================================= */

function InfoCard({
    label,
    value,
}) {

    return (

        <div className="rounded-2xl border border-ink-200 bg-ink-50/50 p-4">

            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
                {label}
            </p>

            <p className="mt-1 truncate text-sm font-semibold text-ink-900">
                {value || "—"}
            </p>

        </div>
    );
}

export default AdminHospitalDetails;