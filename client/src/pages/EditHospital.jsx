import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import { API_BASE_URL as API_URL } from "../config";

function EditHospital() {

    const { id } = useParams();
    const navigate = useNavigate();


    const [formData, setFormData] = useState({

        name: "",
        city: "",
        address: "",
        phoneNumber: "",
        rating: "",
        consultationFee: "",
        latitude: "",
        longitude: "",
        hospitalType: "",
        description: "",

    });


    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    useEffect(() => {

        loadHospital();

    }, [id]);


    async function loadHospital() {

        try {

            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("token") || localStorage.getItem("adminToken");


            const response = await axios.get(
                `${API_URL}/api/admin/hospitals/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );


            const hospital =
                response.data;


            setFormData({

                name:
                    hospital.name ?? "",

                city:
                    hospital.city ?? "",

                address:
                    hospital.address ?? "",

                phoneNumber:
                    hospital.phoneNumber ?? "",

                rating:
                    hospital.rating ?? "",

                consultationFee:
                    hospital.consultationFee ?? "",

                latitude:
                    hospital.latitude ?? "",

                longitude:
                    hospital.longitude ?? "",

                hospitalType:
                    hospital.hospitalType ?? "",

                description:
                    hospital.description ?? "",

            });

        } catch (err) {

            console.error(
                "Failed to load hospital:",
                err
            );


            if (
                err.response?.status === 401
            ) {

                localStorage.clear();

                navigate(
                    "/login",
                    {
                        replace: true,
                    }
                );

                return;
            }


            if (
                err.response?.status === 403
            ) {

                setError(
                    "You do not have permission to edit hospitals."
                );

                return;
            }


            if (
                err.response?.status === 404
            ) {

                setError(
                    "Hospital not found."
                );

                return;
            }


            setError(
                "Unable to load hospital information."
            );

        } finally {

            setLoading(false);

        }
    }


    function handleChange(event) {

        const {
            name,
            value
        } = event.target;


        setFormData(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );


        setSuccess("");
        setError("");

    }


    async function handleSubmit(event) {

        event.preventDefault();

        setError("");
        setSuccess("");


        if (!formData.name.trim()) {

            setError(
                "Hospital name is required."
            );

            return;
        }


        if (!formData.city.trim()) {

            setError(
                "City is required."
            );

            return;
        }


        try {

            setSaving(true);


            const token =
                localStorage.getItem("token") || localStorage.getItem("adminToken");


            const payload = {

                name:
                    formData.name.trim(),

                city:
                    formData.city.trim(),

                address:
                    formData.address.trim(),

                phoneNumber:
                    formData.phoneNumber.trim(),

                rating:
                    formData.rating === ""
                        ? null
                        : Number(formData.rating),

                consultationFee:
                    formData.consultationFee === ""
                        ? null
                        : Number(formData.consultationFee),

                latitude:
                    formData.latitude === ""
                        ? null
                        : Number(formData.latitude),

                longitude:
                    formData.longitude === ""
                        ? null
                        : Number(formData.longitude),

                hospitalType:
                    formData.hospitalType.trim(),

                description:
                    formData.description.trim(),

            };


            await axios.put(
                `${API_URL}/api/admin/hospitals/${id}`,
                payload,
                {
                    headers: {

                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json",

                    },
                }
            );


            setSuccess(
                "Hospital updated successfully."
            );


            setTimeout(() => {

                navigate(
                    "/admin/hospitals"
                );

            }, 800);


        } catch (err) {

            console.error(
                "Failed to update hospital:",
                err
            );


            if (
                err.response?.status === 401
            ) {

                localStorage.clear();

                navigate(
                    "/login",
                    {
                        replace: true,
                    }
                );

                return;
            }


            if (
                err.response?.status === 403
            ) {

                setError(
                    "You do not have permission to update hospitals."
                );

                return;
            }


            if (
                err.response?.status === 404
            ) {

                setError(
                    "Hospital not found."
                );

                return;
            }


            setError(
                err.response?.data?.message ||
                "Unable to update hospital. Please try again."
            );

        } finally {

            setSaving(false);

        }
    }


    /* ============================================================
       LOADING
    ============================================================ */

    if (loading) {

        return (
            <AdminLayout>

                <div className="flex min-h-[400px] items-center justify-center">

                    <div className="text-center">

                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />

                        <p className="text-sm font-medium text-ink-500">
                            Loading hospital...
                        </p>

                    </div>

                </div>

            </AdminLayout>
        );
    }


    return (
        <AdminLayout>

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="mb-7">

                <span className="inline-flex rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700">
                    Hospital Management
                </span>

                <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink-900">
                    Edit Hospital
                </h1>

                <p className="mt-2 text-base text-ink-500">
                    Update the hospital's information and save your changes.
                </p>

            </div>


            {/* ==================================================
                FORM CARD
            ================================================== */}

            <div className="rounded-3xl border border-ink-200/80 bg-white p-7 shadow-[0_20px_60px_rgba(41,39,37,0.07)] sm:p-9">


                {/* ERROR */}

                {error && (

                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {error}
                    </div>

                )}


                {/* SUCCESS */}

                {success && (

                    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                        {success}
                    </div>

                )}


                <form
                    onSubmit={handleSubmit}
                    className="space-y-7"
                >

                    {/* NAME */}

                    <div>

                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-semibold text-ink-800"
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
                            placeholder="MediCompare General Hospital"
                            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        />

                    </div>


                    {/* CITY + PHONE */}

                    <div className="grid gap-6 md:grid-cols-2">

                        <div>

                            <label
                                htmlFor="city"
                                className="mb-2 block text-sm font-semibold text-ink-800"
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
                                placeholder="Vijayawada"
                                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                            />

                        </div>


                        <div>

                            <label
                                htmlFor="phoneNumber"
                                className="mb-2 block text-sm font-semibold text-ink-800"
                            >
                                Phone Number
                            </label>

                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="text"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="0866-1234567"
                                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                            />

                        </div>

                    </div>


                    {/* ADDRESS */}

                    <div>

                        <label
                            htmlFor="address"
                            className="mb-2 block text-sm font-semibold text-ink-800"
                        >
                            Address
                        </label>

                        <input
                            id="address"
                            name="address"
                            type="text"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="MG Road, Vijayawada"
                            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        />

                    </div>


                    {/* RATING + FEE */}

                    <div className="grid gap-6 md:grid-cols-2">

                        <div>

                            <label
                                htmlFor="rating"
                                className="mb-2 block text-sm font-semibold text-ink-800"
                            >
                                Rating
                            </label>

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
                                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                            />

                            <p className="mt-1.5 text-xs text-ink-400">
                                Rating between 0 and 5.
                            </p>

                        </div>


                        <div>

                            <label
                                htmlFor="consultationFee"
                                className="mb-2 block text-sm font-semibold text-ink-800"
                            >
                                Consultation Fee
                            </label>

                            <div className="relative">

                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink-400">
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
                                    className="w-full rounded-xl border border-ink-200 bg-white py-3.5 pl-9 pr-4 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                                />

                            </div>

                        </div>

                    </div>


                    {/* LATITUDE + LONGITUDE */}

                    <div className="grid gap-6 md:grid-cols-2">

                        <div>

                            <label
                                htmlFor="latitude"
                                className="mb-2 block text-sm font-semibold text-ink-800"
                            >
                                Latitude
                            </label>

                            <input
                                id="latitude"
                                name="latitude"
                                type="number"
                                step="any"
                                value={formData.latitude}
                                onChange={handleChange}
                                placeholder="16.5062"
                                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                            />

                        </div>


                        <div>

                            <label
                                htmlFor="longitude"
                                className="mb-2 block text-sm font-semibold text-ink-800"
                            >
                                Longitude
                            </label>

                            <input
                                id="longitude"
                                name="longitude"
                                type="number"
                                step="any"
                                value={formData.longitude}
                                onChange={handleChange}
                                placeholder="80.6480"
                                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                            />

                        </div>

                    </div>


                    {/* HOSPITAL TYPE */}

                    <div>

                        <label
                            htmlFor="hospitalType"
                            className="mb-2 block text-sm font-semibold text-ink-800"
                        >
                            Hospital Type
                        </label>

                        <input
                            id="hospitalType"
                            name="hospitalType"
                            type="text"
                            value={formData.hospitalType}
                            onChange={handleChange}
                            placeholder="Multi-Specialty"
                            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        />

                    </div>


                    {/* DESCRIPTION */}

                    <div>

                        <label
                            htmlFor="description"
                            className="mb-2 block text-sm font-semibold text-ink-800"
                        >
                            Description
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            rows="5"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the hospital..."
                            className="w-full resize-none rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        />

                    </div>


                    {/* BUTTONS */}

                    <div className="flex flex-col-reverse gap-3 border-t border-ink-100 pt-7 sm:flex-row sm:justify-end">

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/hospitals"
                                )
                            }
                            disabled={saving}
                            className="rounded-xl border border-ink-200 bg-white px-6 py-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {saving ? (

                                <span className="flex items-center justify-center gap-2">

                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                                    Saving...

                                </span>

                            ) : (

                                "Save Changes"

                            )}

                        </button>

                    </div>

                </form>

            </div>

        </AdminLayout>
    );
}


export default EditHospital;