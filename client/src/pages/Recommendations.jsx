import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_BASE_URL as API_URL } from "../config";
import { fetchWithRetry } from "../utils/fetchWithRetry";

const SERVICES = [
    "General Consultation",
    "Cardiology Consultation",
    "Dermatology Consultation",
    "Orthopedic Consultation",
    "Pediatrics Consultation",
    "Gynecology Consultation",
    "General Surgery Consultation",
    "ENT Consultation",
    "Ophthalmology Consultation",
    "Emergency & Casualty Care",
    "Executive Health Checkup",
    "Health Checkup",
];

const CITIES = [
    "Hyderabad",
    "Warangal",
    "Nizamabad",
    "Karimnagar",
    "Khammam",
    "Vijayawada",
    "Visakhapatnam",
    "Guntur",
    "Mangalagiri",
    "Tirupati",
    "Nellore",
    "Kurnool",
    "Rajahmundry",
    "Kakinada",
    "Chennai",
    "Vellore",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Erode",
    "Mahabubnagar",
    "Medak",
    "Sangareddy",
    "Siddipet",
    "Jagtial",
    "Peddapalli",
    "Mancherial",
    "Nirmal",
    "Kamareddy",
    "Medchal",
    "Shamshabad",
    "Vikarabad",
    "Wanaparthy",
    "Nagarkurnool",
    "Gadwal",
    "Narayanpet",
    "Mahabubabad",
    "Kothagudem",
    "Bhupalpally",
    "Mulugu",
    "Jangaon",
    "Sircilla",
    "Suryapet",
    "Asifabad",
    "Hanamkonda",
    "Bhuvanagiri",
    "Paderu",
    "Anakapalli",
    "Rayachoti",
    "Bapatla",
    "Eluru",
    "Amalapuram",
    "Machilipatnam",
    "Nandyal",
    "Narasaraopet",
    "Parvathipuram",
    "Puttaparthi",
    "Vizianagaram",
    "Bhimavaram",
    "Kadapa",
    "Bengaluru",
    "Mysuru",
    "Mangaluru",
    "Hubballi",
    "Belagavi",
    "Mumbai",
    "Pune",
    "Delhi",
    "Kolkata",
    "Ahmedabad",
    "Jaipur",
    "Kochi",
    "Lucknow",
    "Bhubaneswar",
];

const HOSPITAL_TYPES = [
    "Multi-Specialty",
    "Super-Specialty",
    "General",
    "Private",
    "Government",
];

function Recommendations() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        service: "",
        city: "",
        maxBudget: "",
        minRating: "",
        hospitalType: "",
    });

    const [recommendations, setRecommendations] = useState([]);
    const [aiExplanation, setAiExplanation] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setAiExplanation("");
        setRecommendations([]);

        if (!form.service) {
            setError("Please select a healthcare service.");
            return;
        }

        const requestBody = {
            service: form.service,
            city: form.city || null,
            maxBudget:
                form.maxBudget === ""
                    ? null
                    : Number(form.maxBudget),
            minRating:
                form.minRating === ""
                    ? null
                    : Number(form.minRating),
            hospitalType: form.hospitalType || null,
        };

        try {
            setLoading(true);

            const response = await fetchWithRetry(
                `${API_URL}/api/recommendations/ai`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                },
                { retries: 2, timeout: 60000, retryDelay: 3000 }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        "Unable to generate recommendations."
                );
            }

            setRecommendations(
                Array.isArray(data?.recommendations)
                    ? data.recommendations
                    : []
            );

            setAiExplanation(
                data?.aiExplanation || ""
            );
        } catch (err) {
            setError(
                err.message ||
                    "Something went wrong while generating recommendations."
            );
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setForm({
            service: "",
            city: "",
            maxBudget: "",
            minRating: "",
            hospitalType: "",
        });

        setRecommendations([]);
        setAiExplanation("");
        setError("");
    }

    function viewHospital(hospitalId) {
        const hospital = recommendations.find(
            (item) => item.hospitalId === hospitalId
        );

        navigate(`/hospitals/${hospitalId}`, {
            state: {
                hospital,
            },
        });
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Header */}
                <section className="mb-8">
                    <div className="max-w-3xl">
                        <p className="mb-2 text-sm font-bold uppercase tracking-wider text-blue-600">
                            AI-Powered Healthcare Matching
                        </p>

                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            Find the right hospital for you
                        </h1>

                        <p className="mt-3 text-base leading-7 text-slate-600">
                            Tell MediCompare what you need. We compare
                            services, prices, location, hospital ratings,
                            and real user reviews to rank suitable
                            hospitals for you.
                        </p>
                    </div>
                </section>

                {/* Search Form */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <form onSubmit={handleSubmit}>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                            {/* Service */}
                            <div>
                                <label
                                    htmlFor="service"
                                    className="mb-2 block text-sm font-bold text-slate-700"
                                >
                                    Healthcare Service
                                </label>

                                <select
                                    id="service"
                                    name="service"
                                    value={form.service}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">
                                        Select a service
                                    </option>

                                    {SERVICES.map((service) => (
                                        <option
                                            key={service}
                                            value={service}
                                        >
                                            {service}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* City */}
                            <div>
                                <label
                                    htmlFor="city"
                                    className="mb-2 block text-sm font-bold text-slate-700"
                                >
                                    Preferred City
                                </label>

                                <select
                                    id="city"
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">
                                        Any city
                                    </option>

                                    {CITIES.map((city) => (
                                        <option
                                            key={city}
                                            value={city}
                                        >
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Budget */}
                            <div>
                                <label
                                    htmlFor="maxBudget"
                                    className="mb-2 block text-sm font-bold text-slate-700"
                                >
                                    Maximum Budget (₹)
                                </label>

                                <input
                                    id="maxBudget"
                                    name="maxBudget"
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 1000"
                                    value={form.maxBudget}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Minimum Rating */}
                            <div>
                                <label
                                    htmlFor="minRating"
                                    className="mb-2 block text-sm font-bold text-slate-700"
                                >
                                    Minimum Rating
                                </label>

                                <select
                                    id="minRating"
                                    name="minRating"
                                    value={form.minRating}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">
                                        Any rating
                                    </option>

                                    <option value="4">
                                        4.0+ ⭐
                                    </option>

                                    <option value="4.5">
                                        4.5+ ⭐
                                    </option>

                                    <option value="4.8">
                                        4.8+ ⭐
                                    </option>
                                </select>
                            </div>

                            {/* Hospital Type */}
                            <div>
                                <label
                                    htmlFor="hospitalType"
                                    className="mb-2 block text-sm font-bold text-slate-700"
                                >
                                    Hospital Type
                                </label>

                                <select
                                    id="hospitalType"
                                    name="hospitalType"
                                    value={form.hospitalType}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">
                                        Any type
                                    </option>

                                    {HOSPITAL_TYPES.map((type) => (
                                        <option
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Finding hospitals..."
                                    : "✨ Find Best Hospitals"}
                            </button>

                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                            >
                                Reset
                            </button>
                        </div>

                        {error && (
                            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                {error}
                            </div>
                        )}
                    </form>
                </section>

                {/* AI Explanation */}
                {aiExplanation && (
                    <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm sm:p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
                                ✨
                            </div>

                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900">
                                    MediCompare AI's analysis
                                </h2>

                                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                    {aiExplanation}
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Results */}
                {recommendations.length > 0 && (
                    <section className="mt-8">

                        <div className="mb-5 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                                    Recommended for you
                                </p>

                                <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                                    Top matching hospitals
                                </h2>
                            </div>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
                                {recommendations.length} matches
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            {recommendations.map(
                                (hospital, index) => (
                                    <article
                                        key={
                                            hospital.hospitalId ||
                                            index
                                        }
                                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        {/* Rank */}
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
                                                #{index + 1} Recommended
                                            </span>

                                            <span className="text-sm font-bold text-slate-500">
                                                Score{" "}
                                                {Number(
                                                    hospital.score || 0
                                                ).toFixed(1)}
                                            </span>
                                        </div>

                                        {/* Hospital name */}
                                        <h3 className="text-xl font-extrabold text-slate-900">
                                            {hospital.hospitalName}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            📍 {hospital.city}
                                            {hospital.hospitalType
                                                ? ` • ${hospital.hospitalType}`
                                                : ""}
                                        </p>

                                        {/* Metrics */}
                                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

                                            <div className="rounded-xl bg-slate-50 p-3">
                                                <p className="text-xs font-semibold text-slate-500">
                                                    Rating
                                                </p>

                                                <p className="mt-1 font-extrabold text-slate-900">
                                                    ⭐{" "}
                                                    {Number(
                                                        hospital.rating || 0
                                                    ).toFixed(1)}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-slate-50 p-3">
                                                <p className="text-xs font-semibold text-slate-500">
                                                    Reviews
                                                </p>

                                                <p className="mt-1 font-extrabold text-slate-900">
                                                    {hospital.reviewCount ||
                                                        0}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-slate-50 p-3">
                                                <p className="text-xs font-semibold text-slate-500">
                                                    Review Avg.
                                                </p>

                                                <p className="mt-1 font-extrabold text-slate-900">
                                                    {Number(
                                                        hospital.reviewAverage ||
                                                            0
                                                    ).toFixed(1)}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-slate-50 p-3">
                                                <p className="text-xs font-semibold text-slate-500">
                                                    Service Price
                                                </p>

                                                <p className="mt-1 font-extrabold text-slate-900">
                                                    ₹
                                                    {Number(
                                                        hospital.servicePrice ||
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Recommendation level */}
                                        {hospital.recommendationLevel && (
                                            <div className="mt-4">
                                                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                                    {
                                                        hospital.recommendationLevel
                                                    }
                                                </span>
                                            </div>
                                        )}

                                        {/* Reasons */}
                                        {Array.isArray(
                                            hospital.reasons
                                        ) &&
                                            hospital.reasons.length >
                                                0 && (
                                                <div className="mt-5">
                                                    <p className="mb-2 text-sm font-extrabold text-slate-800">
                                                        Why it matched
                                                    </p>

                                                    <ul className="space-y-2">
                                                        {hospital.reasons
                                                            .slice(
                                                                0,
                                                                4
                                                            )
                                                            .map(
                                                                (
                                                                    reason,
                                                                    reasonIndex
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            reasonIndex
                                                                        }
                                                                        className="flex gap-2 text-sm leading-6 text-slate-600"
                                                                    >
                                                                        <span className="mt-1 text-emerald-600">
                                                                            ✓
                                                                        </span>

                                                                        <span>
                                                                            {
                                                                                reason
                                                                            }
                                                                        </span>
                                                                    </li>
                                                                )
                                                            )}
                                                    </ul>
                                                </div>
                                            )}

                                        {/* Action */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                viewHospital(
                                                    hospital.hospitalId
                                                )
                                            }
                                            className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                                        >
                                            View Hospital
                                        </button>
                                    </article>
                                )
                            )}
                        </div>
                    </section>
                )}

                {/* No results */}
                {!loading &&
                    !error &&
                    recommendations.length === 0 &&
                    aiExplanation &&
                    (
                        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <div className="text-4xl">
                                🔎
                            </div>

                            <h2 className="mt-3 text-xl font-extrabold text-slate-900">
                                No matching hospitals found
                            </h2>

                            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Try increasing your budget, lowering
                                the minimum rating, or choosing
                                another city.
                            </p>
                        </section>
                    )}
            </main>
        </div>
    );
}

export default Recommendations;