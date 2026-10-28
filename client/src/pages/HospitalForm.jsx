import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import { API_BASE_URL as API_URL } from "../config";


function HospitalForm() {

    const navigate = useNavigate();


    const [formData, setFormData] = useState({

        name: "",
        city: "",
        address: "",
        phoneNumber: "",
        hospitalType: "",
        rating: "",
        consultationFee: "",
        location: "",
        description: "",
        imageUrl: ""

    });


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    function handleChange(event) {

        const {
            name,
            value
        } = event.target;

        setFormData(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );
    }


    async function handleSubmit(event) {

        event.preventDefault();

        setError("");
        setLoading(true);


        try {

            const token =
                localStorage.getItem("token") || localStorage.getItem("adminToken");


            const hospitalData = {

                name: formData.name,
                city: formData.city,
                address: formData.address,
                phoneNumber: formData.phoneNumber,
                hospitalType: formData.hospitalType,

                rating:
                    formData.rating
                        ? Number(formData.rating)
                        : null,

                consultationFee:
                    formData.consultationFee
                        ? Number(formData.consultationFee)
                        : null,

                location: formData.location,
                description: formData.description,
                imageUrl: formData.imageUrl

            };


            await axios.post(
                `${API_URL}/api/admin/hospitals`,
                hospitalData,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


            navigate("/admin/hospitals");

        } catch (err) {

            console.error(
                "Failed to add hospital:",
                err
            );


            if (err.response?.data?.message) {

                setError(
                    err.response.data.message
                );

            } else if (
                err.response?.status === 401
            ) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else if (
                err.response?.status === 403
            ) {

                setError(
                    "You do not have permission to add a hospital."
                );

            } else {

                setError(
                    "Unable to add the hospital. Please check that the server is running."
                );
            }

        } finally {

            setLoading(false);

        }
    }


    return (
        <AdminLayout>

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="mb-7">

                <span className="inline-flex rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700">
                    Hospital Management
                </span>

                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink-900">
                    Add Hospital
                </h1>

                <p className="mt-2 text-base text-ink-500">
                    Add a new hospital and its basic information to MediCompare.
                </p>

            </div>


            {/* ==================================================
                FORM
            ================================================== */}

            <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-ink-200 bg-white p-7 shadow-[0_12px_40px_rgba(41,39,37,0.06)] sm:p-9"
            >

                {/* ==================================================
                    HOSPITAL INFORMATION
                ================================================== */}

                <section>

                    <div className="mb-7">

                        <h2 className="text-xl font-semibold text-ink-900">
                            Hospital Information
                        </h2>

                        <p className="mt-1.5 text-sm text-ink-500">
                            Enter the basic information about the hospital.
                        </p>

                    </div>


                    {/* NAME */}

                    <div className="mb-6">

                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-ink-700"
                        >
                            Hospital Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. KIMS Hospitals"
                            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        />

                    </div>


                    {/* CITY + PHONE */}

                    <div className="grid gap-6 md:grid-cols-2">

                        <div>

                            <label
                                htmlFor="city"
                                className="mb-2 block text-sm font-medium text-ink-700"
                            >
                                City
                            </label>

                            <input
                                id="city"
                                name="city"
                                type="text"
                                required
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="e.g. Vijayawada"
                                className="w-full rounded-xl border border-ink-200 px-4 py-3.5 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                            />

                        </div>


                        <div>

                            <label
                                htmlFor="phoneNumber"
                                className="mb-2 block text-sm font-medium text-ink-700"
                            >
                                Phone Number
                            </label>

                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="e.g. 0866-1234567"
                                className="w-full rounded-xl border border-ink-200 px-4 py-3.5 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                            />

                        </div>

                    </div>


                    {/* ADDRESS */}

                    <div className="mt-6">

                        <label
                            htmlFor="address"
                            className="mb-2 block text-sm font-medium text-ink-700"
                        >
                            Address
                        </label>

                        <input
                            id="address"
                            name="address"
                            type="text"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="e.g. MG Road, Vijayawada"
                            className="w-full rounded-xl border border-ink-200 px-4 py-3.5 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        />

                    </div>


                    {/* LOCATION */}

                    <div className="mt-6">

                        <label
                            htmlFor="location"
                            className="mb-2 block text-sm font-medium text-ink-700"
                        >
                            Location
                        </label>

                        <input
                            id="location"
                            name="location"
                            type="text"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Benz Circle, Vijayawada"
                            className="w-full rounded-xl border border-ink-200 px-4 py-3.5 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        />

                        <p className="mt-2 text-xs text-ink-400">
                            Enter the location users should see for this hospital.
                        </p>

                    </div>


                    {/* TYPE + RATING */}

                    <div className="mt-6 grid gap-6 md:grid-cols-2">

                        <div>

                            <label
                                htmlFor="hospitalType"
                                className="mb-2 block text-sm font-medium text-ink-700"
                            >
                                Hospital Type
                            </label>

                            <select
                                id="hospitalType"
                                name="hospitalType"
                                required
                                value={formData.hospitalType}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                            >

                                <option value="">
                                    Select type
                                </option>

                                <option value="Multi-Specialty">
                                    Multi-Specialty
                                </option>

                                <option value="General">
                                    General
                                </option>

                                <option value="Specialty">
                                    Specialty
                                </option>

                                <option value="Government">
                                    Government
                                </option>

                                <option value="Private">
                                    Private
                                </option>

                            </select>

                        </div>


                        <div>

                            <label
                                htmlFor="rating"
                                className="mb-2 block text-sm font-medium text-ink-700"
                            >
                                Rating
                            </label>

                            <div className="relative">

                                <input
                                    id="rating"
                                    name="rating"
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={formData.rating}
                                    onChange={handleChange}
                                    placeholder="4.5"
                                    className="w-full rounded-xl border border-ink-200 px-4 py-3.5 pr-16 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                                />

                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-400">
                                    / 5
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* CONSULTATION FEE */}

                    <div className="mt-6 max-w-md">

                        <label
                            htmlFor="consultationFee"
                            className="mb-2 block text-sm font-medium text-ink-700"
                        >
                            Consultation Fee
                        </label>

                        <div className="relative">

                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500">
                                ₹
                            </span>

                            <input
                                id="consultationFee"
                                name="consultationFee"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.consultationFee}
                                onChange={handleChange}
                                placeholder="500"
                                className="w-full rounded-xl border border-ink-200 py-3.5 pl-10 pr-4 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                            />

                        </div>

                        <p className="mt-2 text-xs text-ink-400">
                            This is the general consultation fee.
                            Individual services can have their own prices later.
                        </p>

                    </div>

                </section>


                {/* ==================================================
                    IMAGE
                ================================================== */}

                <section className="mt-9 border-t border-ink-100 pt-9">

                    <div className="mb-7">

                        <h2 className="text-xl font-semibold text-ink-900">
                            Hospital Image
                        </h2>

                        <p className="mt-1.5 text-sm text-ink-500">
                            Add an image using a publicly accessible image URL.
                        </p>

                    </div>


                    <label
                        htmlFor="imageUrl"
                        className="mb-2 block text-sm font-medium text-ink-700"
                    >
                        Image URL
                    </label>

                    <input
                        id="imageUrl"
                        name="imageUrl"
                        type="url"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/hospital-image.jpg"
                        className="w-full rounded-xl border border-ink-200 px-4 py-3.5 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                    />

                    <p className="mt-2 text-xs text-ink-400">
                        Paste the direct public image URL here.
                    </p>


                    {formData.imageUrl && (

                        <div className="mt-5 overflow-hidden rounded-2xl border border-ink-200 bg-ink-50">

                            <img
                                src={formData.imageUrl}
                                alt="Hospital preview"
                                className="h-64 w-full object-cover"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                onError={(event) => {
                                    event.currentTarget.style.display =
                                        "none";
                                }}
                            />

                        </div>

                    )}

                </section>


                {/* ==================================================
                    DESCRIPTION
                ================================================== */}

                <section className="mt-9 border-t border-ink-100 pt-9">

                    <div className="mb-7">

                        <h2 className="text-xl font-semibold text-ink-900">
                            Description
                        </h2>

                        <p className="mt-1.5 text-sm text-ink-500">
                            Give users a short description of the hospital.
                        </p>

                    </div>


                    <label
                        htmlFor="description"
                        className="mb-2 block text-sm font-medium text-ink-700"
                    >
                        Hospital Description
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        rows="5"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the hospital, its specialties, facilities and important information..."
                        className="w-full resize-none rounded-xl border border-ink-200 px-4 py-3.5 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                    />

                </section>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>

                )}


                {/* ==================================================
                    ACTIONS
                ================================================== */}

                <div className="mt-9 flex flex-col-reverse gap-3 border-t border-ink-100 pt-7 sm:flex-row sm:justify-end">

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/hospitals")
                        }
                        className="rounded-xl border border-ink-200 px-6 py-3 text-sm font-medium text-ink-700 transition hover:bg-ink-50"
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl bg-brand-500 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? "Adding Hospital..."
                            : "Add Hospital"}
                    </button>

                </div>

            </form>

        </AdminLayout>
    );
}


export default HospitalForm;