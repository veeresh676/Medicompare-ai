import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { handleHospitalImageError } from "../utils/hospitalImage";

function Compare() {
    const [hospitals, setHospitals] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [comparison, setComparison] = useState([]);

    const [loadingHospitals, setLoadingHospitals] = useState(true);
    const [loadingComparison, setLoadingComparison] = useState(false);

    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [verdict, setVerdict] = useState(null);
    const [loadingVerdict, setLoadingVerdict] = useState(false);
    const [verdictError, setVerdictError] = useState("");

    // Load hospitals when the component mounts.
    useEffect(() => {
        let isMounted = true;

        async function loadHospitals() {
            try {
                setLoadingHospitals(true);
                setError("");

                const response = await api.get("/hospitals", {
                    params: {
                        size: 300,
                    },
                });

                const data = Array.isArray(response.data)
                    ? response.data
                    : response.data?.content || [];

                if (isMounted) {
                    setHospitals(data);
                }
            } catch (err) {
                console.error("Failed to load hospitals:", err);

                if (isMounted) {
                    setError(
                        err.response?.data?.message ||
                            "Unable to load hospitals. Please check your connection and try again."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoadingHospitals(false);
                }
            }
        }

        loadHospitals();

        return () => {
            isMounted = false;
        };
    }, []);

    // Select or deselect hospitals.
    function toggleHospital(id) {
        setError("");

        setSelectedIds((current) => {
            if (current.includes(id)) {
                return current.filter(
                    (hospitalId) => hospitalId !== id
                );
            }

            if (current.length >= 4) {
                setError("You can compare a maximum of 4 hospitals.");
                return current;
            }

            return [...current, id];
        });
    }

    // Compare selected hospitals.
    async function compareHospitals() {
        if (selectedIds.length < 2) {
            setError("Please select at least 2 hospitals to compare.");
            return;
        }

        try {
            setLoadingComparison(true);
            setError("");
            setComparison([]);
            setVerdict(null);
            setVerdictError("");

            // Repeat hospitalIds so Spring Boot receives a list.
            const query = selectedIds
                .map(
                    (id) =>
                        `hospitalIds=${encodeURIComponent(id)}`
                )
                .join("&");

            const response = await api.get(
                `/compare/hospitals?${query}`
            );

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.content || [];

            if (data.length === 0) {
                throw new Error(
                    "The comparison service returned no results."
                );
            }

            setComparison(data);

            // Load the AI recommendation separately.
            fetchVerdict([...selectedIds]);

            // Scroll to the comparison table.
            setTimeout(() => {
                document
                    .getElementById("comparison-results")
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
            }, 100);
        } catch (err) {
            console.error("Comparison failed:", err);

            setError(
                err.response?.data?.message ||
                    err.response?.data?.error ||
                    err.message ||
                    "Unable to compare hospitals. Please try again."
            );

            setComparison([]);
        } finally {
            setLoadingComparison(false);
        }
    }

    // Clear the current selection and results.
    function clearComparison() {
        setSelectedIds([]);
        setComparison([]);
        setVerdict(null);
        setVerdictError("");
        setError("");
        setSearch("");
    }

    // Fetch the AI recommendation.
    async function fetchVerdict(hospitalIds) {
        try {
            setLoadingVerdict(true);
            setVerdictError("");
            setVerdict(null);

            const response = await api.post(
                "/compare/ai-verdict",
                { hospitalIds },
                { timeout: 90000 }
            );

            setVerdict(response.data || null);
        } catch (err) {
            console.error("AI verdict failed:", err);

            setVerdictError(
                err.response?.data?.message ||
                    "AI verdict is unavailable right now. The comparison table is still available below."
            );
        } finally {
            setLoadingVerdict(false);
        }
    }

    // Search hospitals by name, city, type, or address.
    const filteredHospitals = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return hospitals;
        }

        return hospitals.filter((hospital) => {
            const name = hospital.name?.toLowerCase() || "";
            const city = hospital.city?.toLowerCase() || "";
            const type = hospital.hospitalType?.toLowerCase() || "";
            const address = hospital.address?.toLowerCase() || "";

            return (
                name.includes(query) ||
                city.includes(query) ||
                type.includes(query) ||
                address.includes(query)
            );
        });
    }, [hospitals, search]);

    return (
        <div className="min-h-screen bg-[#faf9f7] text-ink-900">
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-10">
                {/* PAGE HEADER */}

                <section>
                    <p className="text-sm font-semibold text-brand-600">
                        Hospital comparison
                    </p>

                    <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                        Compare hospitals side by side
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500">
                        Select two to four hospitals to compare
                        their ratings, consultation fees, services,
                        prices, and availability.
                    </p>
                </section>

                {/* ERROR MESSAGE */}

                {error && (
                    <div
                        role="alert"
                        className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {/* HOSPITAL SELECTION */}

                <section className="mt-8">
                    <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <h2 className="text-xl font-semibold">
                                Select hospitals
                            </h2>

                            <p className="mt-1 text-sm text-ink-500">
                                {selectedIds.length} of 4 selected
                                <span className="mx-2">•</span>
                                {hospitals.length} hospitals available
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {selectedIds.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearComparison}
                                    className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
                                >
                                    Clear
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={compareHospitals}
                                disabled={
                                    selectedIds.length < 2 ||
                                    loadingComparison
                                }
                                className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loadingComparison
                                    ? "Comparing..."
                                    : "Compare selected"}
                            </button>
                        </div>
                    </div>

                    {/* SEARCH */}

                    {!loadingHospitals && hospitals.length > 0 && (
                        <div className="mb-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search hospitals by name, city, type or address..."
                                    aria-label="Search hospitals"
                                    className="w-full rounded-xl border border-ink-200 bg-white px-5 py-3.5 pr-12 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                                />

                                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-lg">
                                    🔍
                                </span>
                            </div>

                            {search && (
                                <p className="mt-2 text-xs text-ink-500">
                                    Showing {filteredHospitals.length} of{" "}
                                    {hospitals.length} hospitals
                                </p>
                            )}
                        </div>
                    )}

                    {/* LOADING SKELETONS */}

                    {loadingHospitals ? (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-56 animate-pulse rounded-2xl bg-white"
                                />
                            ))}
                        </div>
                    ) : filteredHospitals.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-10 text-center">
                            <h3 className="font-semibold">
                                No hospitals found
                            </h3>

                            <p className="mt-2 text-sm text-ink-500">
                                {hospitals.length === 0
                                    ? "No hospitals are available right now. Please try again later."
                                    : "Try another search."}
                            </p>

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredHospitals.map((hospital) => (
                                <HospitalSelectionCard
                                    key={hospital.id}
                                    hospital={hospital}
                                    selected={selectedIds.includes(
                                        hospital.id
                                    )}
                                    disabled={
                                        selectedIds.length >= 4 &&
                                        !selectedIds.includes(hospital.id)
                                    }
                                    onSelect={() =>
                                        toggleHospital(hospital.id)
                                    }
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* COMPARISON RESULTS */}

                {comparison.length > 0 && (
                    <div id="comparison-results">
                        <ComparisonTable
                            hospitals={comparison}
                            verdict={verdict}
                            loadingVerdict={loadingVerdict}
                            verdictError={verdictError}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}

/* =========================================================
   HOSPITAL SELECTION CARD
========================================================= */

function HospitalSelectionCard({
    hospital,
    selected,
    disabled,
    onSelect,
}) {
    const rating =
        hospital.rating != null && Number.isFinite(Number(hospital.rating))
            ? Number(hospital.rating).toFixed(1)
            : null;

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={disabled}
            aria-pressed={selected}
            className={`overflow-hidden rounded-2xl border bg-white text-left transition ${
                selected
                    ? "border-brand-500 ring-2 ring-brand-100"
                    : "border-ink-200 hover:border-ink-300 hover:shadow-sm"
            } ${
                disabled
                    ? "cursor-not-allowed opacity-50"
                    : ""
            }`}
        >
            <div className="relative h-36 bg-ink-100">
                {hospital.imageUrl ? (
                    <img
                        src={hospital.imageUrl}
                        alt={hospital.name || "Hospital"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(event) =>
                            handleHospitalImageError(
                                event,
                                hospital.id ?? hospital.name
                            )
                        }
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-5xl">
                        🏥
                    </div>
                )}

                <div
                    className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full ${
                        selected
                            ? "bg-brand-500 text-white"
                            : "bg-white text-ink-400"
                    }`}
                >
                    {selected ? "✓" : ""}
                </div>
            </div>

            <div className="p-5">
                <h3 className="font-semibold">
                    {hospital.name || "Unnamed hospital"}
                </h3>

                <p className="mt-1 text-sm text-ink-500">
                    {hospital.city ||
                        hospital.address ||
                        "Location unavailable"}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {rating !== null && (
                        <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                            ★ {rating}
                        </span>
                    )}

                    {hospital.hospitalType && (
                        <span className="text-xs text-ink-400">
                            {hospital.hospitalType}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}

/* =========================================================
   COMPARISON TABLE
========================================================= */

function ComparisonTable({
    hospitals,
    verdict,
    loadingVerdict,
    verdictError,
}) {
    const allServices = useMemo(() => {
        const map = new Map();

        hospitals.forEach((hospital) => {
            (hospital.services || []).forEach((service) => {
                const key = service.name?.trim().toLowerCase();

                if (!key) {
                    return;
                }

                if (!map.has(key)) {
                    map.set(key, service.name.trim());
                }
            });
        });

        return Array.from(map.entries()).map(([key, name]) => ({
            key,
            name,
        }));
    }, [hospitals]);

    function getService(hospital, serviceKey) {
        return (hospital.services || []).find(
            (service) =>
                service.name?.trim().toLowerCase() === serviceKey
        );
    }

    return (
        <section className="mt-12">
            <div className="mb-6">
                <p className="text-sm font-semibold text-brand-600">
                    Results
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                    Hospital comparison
                </h2>

                <p className="mt-2 text-sm text-ink-500">
                    Compare the available information carefully. Fees,
                    ratings, and service details may need confirmation
                    directly with each hospital.
                </p>
            </div>

            {/* AI RECOMMENDATION LOADING */}

            {loadingVerdict && (
                <div className="mb-6 overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-white p-6 shadow-sm sm:p-8">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-xl text-white">
                            ✨
                        </div>

                        <div className="flex-1">
                            <div className="h-4 w-48 animate-pulse rounded-full bg-brand-100" />
                            <div className="mt-2 h-3 w-72 max-w-full animate-pulse rounded-full bg-ink-100" />
                        </div>
                    </div>

                    <p className="mt-4 text-sm text-ink-500">
                        Generating a recommendation from the available
                        comparison data...
                    </p>
                </div>
            )}

            {/* AI ERROR */}

            {!loadingVerdict && verdictError && (
                <div
                    role="status"
                    className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800"
                >
                    {verdictError}
                </div>
            )}

            {/* AI VERDICT */}

            {!loadingVerdict && verdict && (
                <div className="mb-6 overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-white shadow-sm">
                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-xl text-white shadow-sm">
                                ✨
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                                    AI Recommendation
                                </p>

                                <h3 className="mt-1 text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
                                    {verdict.winnerHospitalName ||
                                        "Recommendation"}
                                </h3>

                                {Array.isArray(verdict.scores) &&
                                    verdict.scores.length > 0 && (
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            {verdict.scores.map((entry) => (
                                                <span
                                                    key={entry.hospitalId}
                                                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                                                        entry.hospitalId ===
                                                        verdict.winnerHospitalId
                                                            ? "bg-brand-500 text-white"
                                                            : "bg-white text-ink-600 ring-1 ring-ink-200"
                                                    }`}
                                                >
                                                    {entry.hospitalName
                                                        ? `${entry.hospitalName}: `
                                                        : ""}
                                                    {entry.score != null &&
                                                    Number.isFinite(
                                                        Number(entry.score)
                                                    )
                                                        ? Number(
                                                              entry.score
                                                          ).toFixed(1)
                                                        : "N/A"}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                {Array.isArray(verdict.winnerReasons) &&
                                    verdict.winnerReasons.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {verdict.winnerReasons.map(
                                                (reason, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-start gap-2.5"
                                                    >
                                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                                                            ✓
                                                        </span>

                                                        <p className="text-sm leading-6 text-ink-700">
                                                            {reason}
                                                        </p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                            </div>
                        </div>

                        {verdict.explanation && (
                            <div className="mt-6 rounded-2xl border border-brand-100 bg-white/80 p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                                    {verdict.aiAvailable
                                        ? "AI analysis"
                                        : "Ranking summary"}
                                </p>

                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-ink-700">
                                    {verdict.explanation}
                                </p>
                            </div>
                        )}

                        <p className="mt-5 text-xs leading-5 text-ink-500">
                            This recommendation is decision support, not
                            medical advice. Confirm costs, services, and
                            suitability with the hospital and your healthcare
                            professional.
                        </p>
                    </div>
                </div>
            )}

            {/* COMPARISON TABLE */}

            <div className="overflow-x-auto rounded-2xl border border-ink-200 bg-white shadow-sm">
                <table className="min-w-[900px] w-full border-collapse">
                    <thead>
                        <tr className="border-b border-ink-200 bg-ink-50">
                            <th className="sticky left-0 z-10 min-w-[220px] bg-ink-50 px-5 py-5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                                Category
                            </th>

                            {hospitals.map((hospital, index) => (
                                <th
                                    key={
                                        hospital.hospitalId ??
                                        hospital.id ??
                                        index
                                    }
                                    className="min-w-[220px] px-5 py-5 text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-ink-100">
                                            {hospital.imageUrl ? (
                                                <img
                                                    src={hospital.imageUrl}
                                                    alt={
                                                        hospital.hospitalName ||
                                                        hospital.name ||
                                                        "Hospital"
                                                    }
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer"
                                                    onError={(event) =>
                                                        handleHospitalImageError(
                                                            event,
                                                            hospital.hospitalId ??
                                                                hospital.id ??
                                                                hospital.hospitalName
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    🏥
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="font-semibold text-ink-900">
                                                {hospital.hospitalName ||
                                                    hospital.name ||
                                                    "Unnamed hospital"}
                                            </p>

                                            <p className="mt-1 text-xs font-normal text-ink-500">
                                                {hospital.city ||
                                                    "Location unavailable"}
                                            </p>
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {/* RATINGS */}

                        <ComparisonRow
                            label="Rating"
                            hospitals={hospitals}
                            render={(hospital) => {
                                if (hospital.reviewAverage != null) {
                                    const count = Number(
                                        hospital.reviewCount || 0
                                    );

                                    return `★ ${Number(
                                        hospital.reviewAverage
                                    ).toFixed(1)} · ${count} patient review${
                                        count === 1 ? "" : "s"
                                    }`;
                                }

                                if (hospital.rating != null) {
                                    return `★ ${Number(
                                        hospital.rating
                                    ).toFixed(1)} · MediCompare rating`;
                                }

                                return "Not rated";
                            }}
                        />

                        {/* CONSULTATION FEE */}

                        <ComparisonRow
                            label="Consultation fee"
                            hospitals={hospitals}
                            render={(hospital) => {
                                const fee = hospital.consultationFee;

                                if (
                                    fee == null ||
                                    fee === "" ||
                                    !Number.isFinite(Number(fee))
                                ) {
                                    return "Not specified";
                                }

                                const formattedFee = `₹${Number(
                                    fee
                                ).toLocaleString("en-IN")}`;

                                return hospital.feeAutoPriced === true
                                    ? `${formattedFee} (Estimated)`
                                    : formattedFee;
                            }}
                        />

                        {/* SERVICES SECTION */}

                        <tr className="border-t border-ink-200">
                            <td
                                colSpan={hospitals.length + 1}
                                className="bg-ink-50 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-ink-500"
                            >
                                Services
                            </td>
                        </tr>

                        {allServices.length === 0 ? (
                            <tr className="border-t border-ink-100">
                                <td
                                    colSpan={hospitals.length + 1}
                                    className="px-5 py-8 text-center text-sm text-ink-500"
                                >
                                    No service information is available
                                    for the selected hospitals.
                                </td>
                            </tr>
                        ) : (
                            allServices.map((service) => {
                                const prices = hospitals
                                    .map((hospital) => {
                                        const item = getService(
                                            hospital,
                                            service.key
                                        );

                                        if (
                                            item?.price == null ||
                                            item.price === "" ||
                                            !Number.isFinite(
                                                Number(item.price)
                                            )
                                        ) {
                                            return null;
                                        }

                                        return Number(item.price);
                                    })
                                    .filter((price) => price !== null);

                                const lowestPrice =
                                    prices.length > 0
                                        ? Math.min(...prices)
                                        : null;

                                // Highlight only a unique lowest price.
                                const cheapestCount =
                                    lowestPrice !== null
                                        ? prices.filter(
                                              (price) =>
                                                  price === lowestPrice
                                          ).length
                                        : 0;

                                return (
                                    <tr
                                        key={service.key}
                                        className="border-t border-ink-100"
                                    >
                                        <td className="sticky left-0 bg-white px-5 py-5 align-top">
                                            <p className="font-semibold">
                                                {service.name}
                                            </p>
                                        </td>

                                        {hospitals.map(
                                            (hospital, index) => {
                                                const item = getService(
                                                    hospital,
                                                    service.key
                                                );

                                                const hospitalKey =
                                                    hospital.hospitalId ??
                                                    hospital.id ??
                                                    index;

                                                if (!item) {
                                                    return (
                                                        <td
                                                            key={hospitalKey}
                                                            className="px-5 py-5 align-top text-sm text-ink-400"
                                                        >
                                                            Not offered
                                                        </td>
                                                    );
                                                }

                                                const price =
                                                    item.price != null &&
                                                    item.price !== "" &&
                                                    Number.isFinite(
                                                        Number(item.price)
                                                    )
                                                        ? Number(item.price)
                                                        : null;

                                                const isCheapest =
                                                    price !== null &&
                                                    lowestPrice !== null &&
                                                    cheapestCount === 1 &&
                                                    price === lowestPrice;

                                                return (
                                                    <td
                                                        key={hospitalKey}
                                                        className="px-5 py-5 align-top"
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div>
                                                                <p
                                                                    className={`font-semibold ${
                                                                        isCheapest
                                                                            ? "text-green-700"
                                                                            : "text-ink-900"
                                                                    }`}
                                                                >
                                                                    {price !==
                                                                    null
                                                                        ? `₹${price.toLocaleString(
                                                                              "en-IN"
                                                                          )}`
                                                                        : "Price not specified"}
                                                                </p>

                                                                {item.durationMinutes !=
                                                                    null && (
                                                                    <p className="mt-1 text-xs text-ink-400">
                                                                        {
                                                                            item.durationMinutes
                                                                        }{" "}
                                                                        min
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <span
                                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                                    item.available
                                                                        ? "bg-green-50 text-green-700"
                                                                        : "bg-red-50 text-red-700"
                                                                }`}
                                                            >
                                                                {item.available
                                                                    ? "Available"
                                                                    : "Unavailable"}
                                                            </span>
                                                        </div>

                                                        {isCheapest && (
                                                            <p className="mt-2 text-xs font-semibold text-green-700">
                                                                Best price
                                                            </p>
                                                        )}
                                                    </td>
                                                );
                                            }
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

/* =========================================================
   REUSABLE COMPARISON ROW
========================================================= */

function ComparisonRow({ label, hospitals, render }) {
    return (
        <tr className="border-t border-ink-100">
            <td className="sticky left-0 bg-white px-5 py-5 font-semibold">
                {label}
            </td>

            {hospitals.map((hospital, index) => (
                <td
                    key={
                        hospital.hospitalId ??
                        hospital.id ??
                        index
                    }
                    className="px-5 py-5 text-sm"
                >
                    {render(hospital)}
                </td>
            ))}
        </tr>
    );
}

export default Compare;