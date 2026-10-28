import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

function AdminServices() {

    const [hospitals, setHospitals] = useState([]);
    const [selectedHospitalId, setSelectedHospitalId] = useState("");

    const [services, setServices] = useState([]);

    const [loadingHospitals, setLoadingHospitals] = useState(true);
    const [loadingServices, setLoadingServices] = useState(false);

    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        durationMinutes: "",
        available: true,
    });


    // =========================================================
    // LOAD HOSPITALS
    // =========================================================

    useEffect(() => {
        loadHospitals();
    }, []);


    async function loadHospitals() {

        try {

            setLoadingHospitals(true);
            setError("");

            const response =
                await api.get("/admin/hospitals");

            const data = response.data;

            setHospitals(data);

            if (data.length > 0) {
                setSelectedHospitalId(
                    String(data[0].id)
                );
            }

        } catch (err) {

            console.error(
                "Failed to load hospitals:",
                err
            );

            setError(
                "Unable to load hospitals."
            );

        } finally {

            setLoadingHospitals(false);
        }
    }


    // =========================================================
    // LOAD SERVICES
    // =========================================================

    useEffect(() => {

        if (!selectedHospitalId) {
            setServices([]);
            return;
        }

        loadServices(selectedHospitalId);

    }, [selectedHospitalId]);


    async function loadServices(hospitalId) {

        try {

            setLoadingServices(true);
            setError("");

            const response =
                await api.get(
                    `/admin/hospitals/${hospitalId}/services`
                );

            setServices(response.data);

        } catch (err) {

            console.error(
                "Failed to load services:",
                err
            );

            const status = err.response?.status;
            const backendMessage =
                err.response?.data?.message ||
                (typeof err.response?.data === "string"
                    ? err.response.data
                    : null);

            if (status === 401 || status === 403) {
                setError(
                    "Admin session expired. Please log in again."
                );
            } else if (status === 404) {
                setError(
                    "Hospital not found."
                );
            } else {
                setError(
                    backendMessage
                        ? `Unable to load services (${status || "network"}): ${backendMessage}`
                        : `Unable to load services (${status || "network error"}). Please press Retry.`
                );
            }

            setServices([]);

        } finally {

            setLoadingServices(false);
        }
    }


    // =========================================================
    // RESET FORM
    // =========================================================

    function resetForm() {

        setForm({
            name: "",
            description: "",
            price: "",
            category: "",
            durationMinutes: "",
            available: true,
        });

        setEditingService(null);
        setShowForm(false);
    }


    // =========================================================
    // CREATE FORM
    // =========================================================

    function openCreateForm() {

        setForm({
            name: "",
            description: "",
            price: "",
            category: "",
            durationMinutes: "",
            available: true,
        });

        setEditingService(null);
        setShowForm(true);
    }


    // =========================================================
    // EDIT FORM
    // =========================================================

    function openEditForm(service) {

        setForm({
            name: service.name || "",
            description: service.description || "",
            price: service.price ?? "",
            category: service.category || "",
            durationMinutes:
                service.durationMinutes ?? "",
            available:
                service.available ?? true,
        });

        setEditingService(service);
        setShowForm(true);
    }


    // =========================================================
    // FORM CHANGE
    // =========================================================

    function handleChange(event) {

        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setForm(previous => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    }


    // =========================================================
    // CREATE / UPDATE SERVICE
    // =========================================================

    async function handleSubmit(event) {

        event.preventDefault();

        if (!selectedHospitalId) {

            setError(
                "Please select a hospital first."
            );

            return;
        }

        try {

            setError("");

            const payload = {
                name: form.name.trim(),

                description:
                    form.description.trim(),

                price: Number(form.price),

                category:
                    form.category.trim(),

                durationMinutes:
                    form.durationMinutes
                        ? Number(
                            form.durationMinutes
                        )
                        : null,

                available:
                    form.available,
            };


            if (editingService) {

                await api.put(
                    `/admin/hospitals/${selectedHospitalId}/services/${editingService.id}`,
                    payload
                );

            } else {

                await api.post(
                    `/admin/hospitals/${selectedHospitalId}/services`,
                    payload
                );
            }


            await loadServices(
                selectedHospitalId
            );

            resetForm();

        } catch (err) {

            console.error(
                "Failed to save service:",
                err
            );

            if (
                err.response?.data?.message
            ) {

                setError(
                    err.response.data.message
                );

            } else {

                setError(
                    "Unable to save service."
                );
            }
        }
    }


    // =========================================================
    // DELETE SERVICE
    // =========================================================

    async function handleDelete(service) {

        const confirmed =
            window.confirm(
                `Delete "${service.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await api.delete(
                `/admin/hospitals/${selectedHospitalId}/services/${service.id}`
            );

            await loadServices(
                selectedHospitalId
            );

        } catch (err) {

            console.error(
                "Failed to delete service:",
                err
            );

            setError(
                "Unable to delete service."
            );
        }
    }


    // =========================================================
    // SELECTED HOSPITAL
    // =========================================================

    const selectedHospital =
        hospitals.find(
            hospital =>
                String(hospital.id) ===
                String(selectedHospitalId)
        );


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="min-h-screen bg-[#faf9f7] text-ink-900">


            {/* =================================================
                NAVBAR
                ================================================= */}

            <header className="border-b border-ink-200/70 bg-[#faf9f7]">

                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

                    <Link
                        to="/admin"
                        className="flex items-center gap-3"
                    >

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-white">
                            M
                        </div>

                        <div>

                            <h1 className="text-lg font-semibold tracking-tight">
                                MediCompare
                            </h1>

                            <p className="text-xs text-ink-500">
                                Administration
                            </p>

                        </div>

                    </Link>


                    <div className="flex items-center gap-4">

                        <div className="hidden text-right sm:block">

                            <p className="text-sm font-medium">
                                bro
                            </p>

                            <p className="text-xs text-ink-500">
                                Administrator
                            </p>

                        </div>


                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">
                            B
                        </div>


                        <button
                            onClick={() => {

                                localStorage.removeItem(
                                    "token"
                                );

                                window.location.href =
                                    "/login";

                            }}
                            className="rounded-xl border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium transition hover:border-ink-300"
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


                {/* BACK */}

                <Link
                    to="/admin"
                    className="inline-flex items-center text-sm font-medium text-ink-600 transition hover:text-brand-600"
                >
                    ← Back to Dashboard
                </Link>


                {/* PAGE HEADER */}

                <section className="mt-8">

                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                        <div>

                            <p className="text-sm font-medium text-brand-600">
                                Administration
                            </p>

                            <h2 className="mt-2 text-4xl font-semibold tracking-tight">
                                Services & Pricing
                            </h2>

                            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-500">
                                Manage healthcare services
                                and individual prices offered
                                by each hospital.
                            </p>

                        </div>


                        <button
                            onClick={openCreateForm}
                            disabled={
                                !selectedHospitalId
                            }
                            className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            + Add Service
                        </button>

                    </div>

                </section>


                {/* =================================================
                    HOSPITAL SELECTOR
                    ================================================= */}

                <section className="mt-8 rounded-2xl border border-ink-200 bg-white p-6">

                    <label className="block text-sm font-semibold">
                        Hospital
                    </label>

                    <p className="mt-1 text-sm text-ink-500">
                        Select the hospital whose services
                        you want to manage.
                    </p>


                    <select
                        value={selectedHospitalId}
                        onChange={event =>
                            setSelectedHospitalId(
                                event.target.value
                            )
                        }
                        disabled={
                            loadingHospitals ||
                            hospitals.length === 0
                        }
                        className="mt-4 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 sm:max-w-xl"
                    >

                        {loadingHospitals && (
                            <option>
                                Loading hospitals...
                            </option>
                        )}


                        {!loadingHospitals &&
                            hospitals.length === 0 && (
                                <option>
                                    No hospitals available
                                </option>
                            )}


                        {hospitals.map(hospital => (

                            <option
                                key={hospital.id}
                                value={hospital.id}
                            >
                                {hospital.name} —{" "}
                                {hospital.city}
                            </option>

                        ))}

                    </select>

                </section>


                {/* =================================================
                    ERROR
                    ================================================= */}

                {error && (

                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4">

                        <p className="font-semibold text-red-700">
                            Something went wrong
                        </p>

                        <p className="mt-1 text-sm text-red-600">
                            {error}
                        </p>

                    </div>

                )}


                {/* =================================================
                    FORM
                    ================================================= */}

                {showForm && (

                    <section className="mt-6 rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">

                        <div className="flex items-center justify-between">

                            <div>

                                <h3 className="text-xl font-semibold">
                                    {editingService
                                        ? "Edit Service"
                                        : "Add Service"}
                                </h3>

                                <p className="mt-1 text-sm text-ink-500">
                                    {selectedHospital?.name}
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-sm font-medium text-ink-500 hover:text-ink-900"
                            >
                                Cancel
                            </button>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                            className="mt-7 space-y-6"
                        >

                            <div className="grid gap-6 md:grid-cols-2">

                                <Field
                                    label="Service Name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Cardiology Consultation"
                                    required
                                />


                                <Field
                                    label="Category"
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    placeholder="e.g. Consultation"
                                />


                                <Field
                                    label="Price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.price}
                                    onChange={handleChange}
                                    placeholder="e.g. 1200"
                                    required
                                    prefix="₹"
                                />


                                <Field
                                    label="Duration"
                                    name="durationMinutes"
                                    type="number"
                                    min="0"
                                    value={
                                        form.durationMinutes
                                    }
                                    onChange={handleChange}
                                    placeholder="e.g. 30"
                                    suffix="minutes"
                                />

                            </div>


                            <div>

                                <label className="block text-sm font-semibold">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Describe this service..."
                                    className="mt-2 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
                                />

                            </div>


                            <label className="flex cursor-pointer items-center gap-3">

                                <input
                                    type="checkbox"
                                    name="available"
                                    checked={
                                        form.available
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="h-4 w-4 accent-brand-500"
                                />

                                <span className="text-sm font-medium">
                                    Service is currently available
                                </span>

                            </label>


                            <div className="flex justify-end gap-3 border-t border-ink-100 pt-6">

                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-semibold hover:border-ink-300"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                                >
                                    {editingService
                                        ? "Save Changes"
                                        : "Add Service"}
                                </button>

                            </div>

                        </form>

                    </section>

                )}


                {/* =================================================
                    SERVICES LIST
                    ================================================= */}

                <section className="mt-8">

                    <div className="mb-5">

                        <h3 className="text-xl font-semibold">
                            {selectedHospital
                                ? selectedHospital.name
                                : "Hospital Services"}
                        </h3>

                        <p className="mt-1 text-sm text-ink-500">
                            {services.length} service
                            {services.length === 1
                                ? ""
                                : "s"} configured
                        </p>

                    </div>


                    {loadingServices ? (

                        <div className="rounded-2xl border border-ink-200 bg-white p-10 text-center">

                            <p className="text-sm text-ink-500">
                                Loading services...
                            </p>

                        </div>

                    ) : services.length === 0 ? (

                        <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-12 text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-2xl">
                                ✚
                            </div>

                            <h4 className="mt-5 text-lg font-semibold">
                                No services yet
                            </h4>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">
                                Add individual healthcare
                                services and their prices
                                for this hospital.
                            </p>

                            <button
                                onClick={openCreateForm}
                                className="mt-5 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600"
                            >
                                + Add First Service
                            </button>

                        </div>

                    ) : (

                        <div className="grid gap-4">

                            {services.map(service => (

                                <div
                                    key={service.id}
                                    className="rounded-2xl border border-ink-200 bg-white p-6 transition hover:border-ink-300"
                                >

                                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

                                        <div className="min-w-0">

                                            <div className="flex flex-wrap items-center gap-2">

                                                <h4 className="text-lg font-semibold">
                                                    {service.name}
                                                </h4>


                                                {service.category && (

                                                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                                                        {service.category}
                                                    </span>

                                                )}


                                                {!service.available && (

                                                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                                                        Unavailable
                                                    </span>

                                                )}

                                            </div>


                                            {service.description && (

                                                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500">
                                                    {service.description}
                                                </p>

                                            )}


                                            <div className="mt-4 flex flex-wrap gap-5 text-sm text-ink-500">

                                                {service.durationMinutes != null && (

                                                    <span>
                                                        ⏱{" "}
                                                        {
                                                            service.durationMinutes
                                                        }{" "}
                                                        minutes
                                                    </span>

                                                )}


                                                <span>
                                                    Service ID:{" "}
                                                    {service.id}
                                                </span>

                                            </div>

                                        </div>


                                        <div className="flex shrink-0 flex-col items-start gap-4 sm:items-end">

                                            <div>

                                                <p className="text-xs text-ink-400">
                                                    Price
                                                </p>

                                                <p className="mt-1 text-2xl font-semibold">
                                                    ₹
                                                    {Number(
                                                        service.price
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </p>

                                            </div>


                                            <div className="flex gap-2">

                                                <button
                                                    onClick={() =>
                                                        openEditForm(
                                                            service
                                                        )
                                                    }
                                                    className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium hover:border-ink-300"
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            service
                                                        )
                                                    }
                                                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}


// =============================================================
// FIELD COMPONENT
// =============================================================

function Field({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    required = false,
    min,
    step,
    prefix,
    suffix,
}) {

    return (

        <div>

            <label className="block text-sm font-semibold">
                {label}
            </label>

            <div className="relative mt-2">

                {prefix && (

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500">
                        {prefix}
                    </span>

                )}


                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    min={min}
                    step={step}
                    className={`w-full rounded-xl border border-ink-200 bg-white py-3 text-sm outline-none transition focus:border-brand-500 ${
                        prefix
                            ? "pl-10 pr-4"
                            : suffix
                                ? "pl-4 pr-20"
                                : "px-4"
                    }`}
                />


                {suffix && (

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-400">
                        {suffix}
                    </span>

                )}

            </div>

        </div>
    );
}


export default AdminServices;