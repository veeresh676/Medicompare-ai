import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { API_BASE_URL as API_URL } from "../config";
import {
    handleHospitalImageError,
} from "../utils/hospitalImage";
import { fetchWithRetry } from "../utils/fetchWithRetry";
import { filterAndSortHospitals } from "../utils/hospitalFilters";

function Hospitals() {

    const navigate = useNavigate();
    const location = useLocation();

    const isAdminPage =
        location.pathname.startsWith("/admin");

    const [hospitals, setHospitals] = useState([]);
    const [hospitalImages, setHospitalImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [city, setCity] = useState("");
    const [stateFilter, setStateFilter] = useState("");
    const [hospitalType, setHospitalType] = useState("");

    const [userLocation, setUserLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [nearbyOnly, setNearbyOnly] = useState(false);
    const [radiusKm, setRadiusKm] = useState(25);


    function requestUserLocation() {
        if (!navigator.geolocation) {
            setLocationError(
                "Geolocation is not supported by your browser."
            );
            return;
        }

        setLocationLoading(true);
        setLocationError("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation([
                    position.coords.latitude,
                    position.coords.longitude,
                ]);
                setNearbyOnly(true);
                setLocationLoading(false);
            },
            () => {
                setLocationLoading(false);
                setLocationError(
                    "Unable to access your location. Please allow location permission in your browser."
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    }


    // Fetch hospitals once when this page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchHospitals();
    }, []);


    async function fetchHospitals(retryCount = 0) {

        try {

            setLoading(true);
            setError("");

            const response = await fetchWithRetry(
                `${API_URL}/api/hospitals?size=200`,
                {},
                { retries: 2, timeout: 45000, retryDelay: 4000 }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load hospitals."
                );
            }

            const data = await response.json();

            const hospitalList =
                Array.isArray(data.content)
                    ? data.content
                    : [];

            setHospitals(hospitalList);


            /*
             * Load the primary uploaded image only for hospitals
             * that don't already ship an imageUrl in the payload.
             * This avoids up to ~200 extra requests on every page
             * load (the main reason the post-login landing felt slow).
             */
            const hospitalsNeedingImages = hospitalList.filter(
                (hospital) =>
                    !hospital.imageUrl ||
                    !hospital.imageUrl.trim()
            );

            const imageEntries = await Promise.all(

                hospitalsNeedingImages.map(async (hospital) => {

                    try {

                        const imageResponse =
                            await fetch(
                                `${API_URL}/api/hospitals/${hospital.id}/images/primary`
                            );


                        if (
                            imageResponse.status === 204 ||
                            imageResponse.status === 404
                        ) {

                            return [
                                hospital.id,
                                null
                            ];
                        }


                        if (!imageResponse.ok) {

                            return [
                                hospital.id,
                                null
                            ];
                        }


                        const image =
                            await imageResponse.json();


                        return [
                            hospital.id,
                            image?.imageUrl || null
                        ];

                    } catch (imageError) {

                        console.warn(
                            `Unable to load primary image for hospital ${hospital.id}:`,
                            imageError
                        );

                        return [
                            hospital.id,
                            null
                        ];
                    }
                })
            );


            setHospitalImages(
                Object.fromEntries(imageEntries)
            );

        } catch (err) {

            console.error(
                "Failed to load hospitals:",
                err
            );

            // fetchWithRetry already retried 2 times internally; this outer retry handles the final fallback
            if (retryCount < 1) {
                await new Promise((resolve) =>
                    setTimeout(resolve, 4000)
                );

                return fetchHospitals(retryCount + 1);
            }

            setError(
                "Unable to reach the server. Please check your connection and press Retry."
            );

        } finally {

            setLoading(false);

        }
    }


    const states = useMemo(() => {

        return [
            ...new Set(
                hospitals
                    .map(hospital => hospital.state)
                    .filter(Boolean)
            )
        ].sort((a, b) =>
            a.localeCompare(b)
        );

    }, [hospitals]);


    const cities = useMemo(() => {

        const additionalCities = [
            ["Udupi", "Karnataka"],
            ["Hassan", "Karnataka"],
            ["Tumakuru", "Karnataka"],
            ["Ballari", "Karnataka"],
            ["Vijayapura", "Karnataka"],
            ["Raichur", "Karnataka"],
            ["Koppal", "Karnataka"],
            ["Gadag", "Karnataka"],
            ["Haveri", "Karnataka"],
            ["Kolar", "Karnataka"],
            ["Surat", "Gujarat"],
            ["Vadodara", "Gujarat"],
            ["Rajkot", "Gujarat"],
            ["Gandhinagar", "Gujarat"],
            ["Nagpur", "Maharashtra"],
            ["Nashik", "Maharashtra"],
            ["Thane", "Maharashtra"],
            ["Kolhapur", "Maharashtra"],
            ["Solapur", "Maharashtra"],
            ["Bhopal", "Madhya Pradesh"],
            ["Indore", "Madhya Pradesh"],
            ["Jabalpur", "Madhya Pradesh"],
            ["Gwalior", "Madhya Pradesh"],
            ["Jodhpur", "Rajasthan"],
            ["Udaipur", "Rajasthan"],
            ["Kota", "Rajasthan"],
            ["Agra", "Uttar Pradesh"],
            ["Kanpur", "Uttar Pradesh"],
            ["Varanasi", "Uttar Pradesh"],
            ["Prayagraj", "Uttar Pradesh"],
            ["Meerut", "Uttar Pradesh"],
            ["Gurugram", "Haryana"],
            ["Faridabad", "Haryana"],
            ["Ludhiana", "Punjab"],
            ["Amritsar", "Punjab"],
            ["Dehradun", "Uttarakhand"],
            ["Raipur", "Chhattisgarh"],
            ["Ranchi", "Jharkhand"],
            ["Patna", "Bihar"],
            ["Guwahati", "Assam"],
            ["Cuttack", "Odisha"],
            ["Kozhikode", "Kerala"],
            ["Thrissur", "Kerala"],
            ["Kollam", "Kerala"],
            ["Kannur", "Kerala"],
            ["Hosur", "Tamil Nadu"],
            ["Tiruppur", "Tamil Nadu"],
            ["Dindigul", "Tamil Nadu"],
            ["Puducherry", "Puducherry"],
            ["Chandigarh", "Chandigarh"],
            ["Jammu", "Jammu and Kashmir"],
            ["Shimla", "Himachal Pradesh"],
            ["Imphal", "Manipur"],
            ["Shillong", "Meghalaya"],
            ["Agartala", "Tripura"],
            ["Aizawl", "Mizoram"],
            ["Kohima", "Nagaland"],
            ["Gangtok", "Sikkim"],
            ["Leh", "Ladakh"]
        ];

        const hospitalCities = hospitals
            .filter(hospital =>
                !stateFilter ||
                hospital.state?.toLowerCase() === stateFilter.toLowerCase()
            )
            .map(hospital => hospital.city)
            .filter(Boolean);

        const newCityNames = additionalCities
            .filter(([, cityState]) =>
                !stateFilter ||
                cityState.toLowerCase() === stateFilter.toLowerCase()
            )
            .map(([city]) => city);

        return [...new Set([...hospitalCities, ...newCityNames])]
            .sort((a, b) => a.localeCompare(b));

    }, [hospitals, stateFilter]);


    const types = useMemo(() => {

        return [
            ...new Set(
                hospitals
                    .map(hospital => hospital.hospitalType)
                    .filter(Boolean)
            )
        ].sort((a, b) =>
            a.localeCompare(b)
        );

    }, [hospitals]);


    const filteredHospitals = useMemo(() => {
        return filterAndSortHospitals(hospitals, {
            search,
            city,
            stateFilter,
            hospitalType,
            nearbyOnly,
            radiusKm,
            userLocation,
        });
    }, [
        hospitals,
        search,
        city,
        stateFilter,
        hospitalType,
        userLocation,
        nearbyOnly,
        radiusKm
    ]);


    function clearFilters() {

        setSearch("");
        setCity("");
        setStateFilter("");
        setHospitalType("");
        setNearbyOnly(false);

    }


    function handleLogout() {

        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("role");

        localStorage.removeItem("userToken");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");

        navigate("/login", {
            replace: true
        });

    }


    function handleHospitalView(id) {

        const selectedHospital = hospitals.find(
            hospital => hospital.id === id
        );


        if (isAdminPage) {

            navigate(
                `/admin/hospitals/${id}`
            );

        } else {

            navigate(
                `/hospitals/${id}`,
                {
                    state: {
                        hospital: selectedHospital
                    }
                }
            );

        }
    }


    function handleHospitalEdit(id) {

        navigate(
            `/admin/hospitals/${id}/edit`
        );

    }


    if (isAdminPage) {

        return (
            <AdminHospitalsPage
                filteredHospitals={filteredHospitals}
                hospitalImages={hospitalImages}
                loading={loading}
                error={error}
                search={search}
                setSearch={setSearch}
                city={city}
                setCity={setCity}
                hospitalType={hospitalType}
                setHospitalType={setHospitalType}
                cities={cities}
                types={types}
                clearFilters={clearFilters}
                fetchHospitals={fetchHospitals}
                navigate={navigate}
                handleLogout={handleLogout}
                handleHospitalView={handleHospitalView}
                handleHospitalEdit={handleHospitalEdit}
            />
        );

    }


    return (
        <UserHospitalsPage
            filteredHospitals={filteredHospitals}
            hospitalImages={hospitalImages}
            loading={loading}
            error={error}
            search={search}
            setSearch={setSearch}
            city={city}
            setCity={setCity}
            stateFilter={stateFilter}
            setStateFilter={setStateFilter}
            hospitalType={hospitalType}
            setHospitalType={setHospitalType}
            cities={cities}
            states={states}
            types={types}
            clearFilters={clearFilters}
            fetchHospitals={fetchHospitals}
            navigate={navigate}
            handleHospitalView={handleHospitalView}
            userLocation={userLocation}
            locationLoading={locationLoading}
            locationError={locationError}
            nearbyOnly={nearbyOnly}
            setNearbyOnly={setNearbyOnly}
            radiusKm={radiusKm}
            setRadiusKm={setRadiusKm}
            requestUserLocation={requestUserLocation}
        />
    );
}


/*
|--------------------------------------------------------------------------
| USER HOSPITAL PAGE
|--------------------------------------------------------------------------
*/

function UserHospitalsPage({

    filteredHospitals,
    hospitalImages,
    loading,
    error,
    search,
    setSearch,
    city,
    setCity,
    stateFilter,
    setStateFilter,
    hospitalType,
    setHospitalType,
    cities,
    states,
    types,
    clearFilters,
    fetchHospitals,
    handleHospitalView,
    userLocation,
    locationLoading,
    locationError,
    nearbyOnly,
    setNearbyOnly,
    radiusKm,
    setRadiusKm,
    requestUserLocation

}) {

    return (

        <div className="min-h-screen bg-ink-50 text-ink-900">

            <Navbar />


            <main className="mx-auto max-w-7xl px-6 py-10">


                {/* PAGE HEADER */}

                <section className="mb-8">

                    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

                        <div>

                            <span className="text-sm font-semibold text-brand-600">
                                Healthcare Directory
                            </span>

                            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink-900">
                                Find the right hospital
                            </h1>

                            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-500">
                                Search and compare hospitals based on
                                location, type, rating, consultation
                                fees and available healthcare services.
                            </p>

                        </div>


<button
    type="button"
    onClick={() => {
        window.location.href = "/compare";
    }}
    className="shrink-0 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
>
    Compare Hospitals {"\u2192"}
</button>

                    </div>

                </section>


                {/* FILTERS */}

                <section className="mb-6 rounded-3xl border border-ink-200 bg-white p-6 shadow-sm">

                    <div className="grid gap-5 lg:grid-cols-[2fr_1fr_1fr_1fr]">


                        {/* SEARCH */}

                        <div>

                            <label
                                htmlFor="hospital-search"
                                className="mb-2 block text-sm font-semibold text-ink-900"
                            >
                                Search
                            </label>

                            <input
                                id="hospital-search"
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search by hospital, city or address..."
                                className="h-14 w-full rounded-xl border border-ink-200 bg-white px-4 text-base text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                            />

                        </div>


                        {/* CITY */}

                        <div>

                            <label
                                htmlFor="hospital-city"
                                className="mb-2 block text-sm font-semibold text-ink-900"
                            >
                                City
                            </label>

                            <select
                                id="hospital-city"
                                value={city}
                                onChange={(event) =>
                                    setCity(
                                        event.target.value
                                    )
                                }
                                className="h-14 w-full rounded-xl border border-ink-200 bg-white px-4 text-base text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                            >

                                <option value="">
                                    All cities
                                </option>

                                {cities.map(
                                    currentCity => (

                                        <option
                                            key={currentCity}
                                            value={currentCity}
                                        >
                                            {currentCity}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* STATE */}

                        <div>

                            <label
                                htmlFor="hospital-state"
                                className="mb-2 block text-sm font-semibold text-ink-900"
                            >
                                State
                            </label>

                            <select
                                id="hospital-state"
                                value={stateFilter}
                                onChange={(event) => {
                                    setStateFilter(
                                        event.target.value
                                    );
                                    setCity("");
                                }}
                                className="h-14 w-full rounded-xl border border-ink-200 bg-white px-4 text-base text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                            >

                                <option value="">
                                    All states
                                </option>

                                {states.map(
                                    currentState => (

                                        <option
                                            key={currentState}
                                            value={currentState}
                                        >
                                            {currentState}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* TYPE */}

                        <div>

                            <label
                                htmlFor="hospital-type"
                                className="mb-2 block text-sm font-semibold text-ink-900"
                            >
                                Hospital type
                            </label>

                            <select
                                id="hospital-type"
                                value={hospitalType}
                                onChange={(event) =>
                                    setHospitalType(
                                        event.target.value
                                    )
                                }
                                className="h-14 w-full rounded-xl border border-ink-200 bg-white px-4 text-base text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                            >

                                <option value="">
                                    All types
                                </option>

                                {types.map(
                                    type => (

                                        <option
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                    </div>


                    {/* LOCATION / NEARBY ROW */}

                    <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-ink-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex flex-wrap items-center gap-3">

                          <button
    type="button"
    onClick={requestUserLocation}
    disabled={locationLoading}
    className="rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
>
    {locationLoading
        ? "Finding you..."
        : userLocation
            ? (
                <>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="inline-block mr-2 align-middle"
                        aria-hidden="true"
                    >
                        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    Location enabled - refresh
                </>
            )
            : (
                <>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="inline-block mr-2 align-middle"
                        aria-hidden="true"
                    >
                        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    Use my location
                </>
            )}
</button>

                            {userLocation && (
                                <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
                                    <input
                                        type="checkbox"
                                        checked={nearbyOnly}
                                        onChange={(event) =>
                                            setNearbyOnly(
                                                event.target.checked
                                            )
                                        }
                                        className="h-4 w-4 accent-brand-500"
                                    />
                                    Nearby only
                                </label>
                            )}

                            {userLocation && nearbyOnly && (
                                <select
                                    value={radiusKm}
                                    onChange={(event) =>
                                        setRadiusKm(
                                            Number(event.target.value)
                                        )
                                    }
                                    className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                                >
                                    <option value={10}>Within 10 km</option>
                                    <option value={25}>Within 25 km</option>
                                    <option value={50}>Within 50 km</option>
                                    <option value={100}>Within 100 km</option>
                                    <option value={300}>Within 300 km</option>
                                </select>
                            )}

                            <button
                                type="button"
                                onClick={clearFilters}
                                disabled={
                                    !search &&
                                    !city &&
                                    !stateFilter &&
                                    !hospitalType &&
                                    !nearbyOnly
                                }
                                className="rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-medium text-ink-600 transition hover:border-ink-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Clear
                            </button>

                        </div>

                        {locationError ? (
                            <p className="text-xs font-medium text-red-600">
                                {locationError}
                            </p>
                        ) : userLocation ? (
                            <p className="text-xs font-medium text-green-700">
                                Showing nearest hospitals first, with distance badges.
                            </p>
                        ) : (
                            <p className="text-xs text-ink-500">
                                Allow location access to find hospitals near you across AP, Telangana, TN & Karnataka.
                            </p>
                        )}

                    </div>

                </section>


                {/* RESULTS */}

                <section>

                    <div className="mb-6">

                        <h2 className="text-3xl font-semibold tracking-tight text-ink-900">
                            Hospitals
                        </h2>

                        <p className="mt-2 text-sm text-ink-500">
                            {filteredHospitals.length}{" "}
                            {filteredHospitals.length === 1
                                ? "hospital"
                                : "hospitals"}{" "}
                            found
                        </p>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

                            <span>
                                {error}
                            </span>

                            <button
                                type="button"
                                onClick={() => fetchHospitals()}
                                className="font-semibold underline"
                            >
                                Retry
                            </button>

                        </div>

                    )}


                    {/* LOADING */}

                    {loading && (

                        <div className="rounded-3xl border border-ink-200 bg-white p-16 text-center shadow-sm">

                            <div className="mx-auto mb-5 h-9 w-9 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />

                            <p className="text-sm text-ink-500">
                                Loading hospitals...
                            </p>

                        </div>

                    )}


                    {/* NO RESULTS */}

                    {!loading &&
                        !error &&
                        filteredHospitals.length === 0 && (

                            <div className="rounded-3xl border border-dashed border-ink-300 bg-white p-16 text-center">

                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-3xl">
                                    Hospital
                                </div>

                                <h3 className="mt-6 text-2xl font-semibold text-ink-900">
                                    No hospitals found
                                </h3>

                                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-500">
                                    Try changing your search or filters
                                    to find available hospitals.
                                </p>

                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-6 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                                >
                                    Clear filters
                                </button>

                            </div>

                        )}


                    {/* HOSPITAL CARDS */}

                    {!loading &&
                        filteredHospitals.length > 0 && (

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                                {filteredHospitals.map(
                                    hospital => (

                                        <UserHospitalCard
                                            key={hospital.id}
                                            hospital={hospital}
                                            primaryImage={
                                                hospitalImages[
                                                    hospital.id
                                                ]
                                            }
                                            distanceKm={
                                                hospital._distanceKm ?? null
                                            }
                                            onView={() =>
                                                handleHospitalView(
                                                    hospital.id
                                                )
                                            }
                                        />

                                    )
                                )}

                            </div>

                        )}

                </section>

            </main>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| USER HOSPITAL CARD
|--------------------------------------------------------------------------
*/

function UserHospitalCard({
    hospital,
    primaryImage,
    distanceKm,
    onView
}) {

    /*
     * Uploaded primary image takes priority.
     * Existing hospital.imageUrl is fallback.
     */
    const rawImageUrl =
        primaryImage ||
        hospital.imageUrl ||
        null;


    /*
     * Backend stores uploaded image paths such as:
     *
     * /uploads/hospitals/example.png
     *
     * The browser must request them from port 8080,
     * not from the React/Vite port 5173.
     */
    const imageUrl =
        rawImageUrl
            ? rawImageUrl.startsWith("http")
                ? rawImageUrl
                : `${API_URL}${rawImageUrl}`
            : null;


    return (

        <article
            onClick={onView}
            className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-100/50"
        >

            {/* IMAGE */}

            <div className="relative h-48 w-full shrink-0 overflow-hidden bg-gradient-to-br from-ink-100 to-ink-50">

                {imageUrl ? (

                    <img
                        src={imageUrl}
                        alt={
                            hospital.name ||
                            "Hospital"
                        }
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(event) =>
                            handleHospitalImageError(
                                event,
                                hospital?.id
                            )
                        }
                    />

                ) : null}


                <div
                    data-image-fallback
                    className={`${
                        imageUrl
                            ? "hidden"
                            : ""
                    } flex h-full items-center justify-center text-5xl`}
                >
                    Hospital
                </div>


                {/* GRADIENT OVERLAY */}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />


                {/* TYPE BADGE overlaid on image */}

                {hospital.hospitalType && (

                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-ink-800 shadow-sm backdrop-blur-sm">
                        {hospital.hospitalType}
                    </span>

                )}


                {/* RATING PILL overlaid on image */}

                {hospital.rating != null && (

                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-ink-800 shadow-sm backdrop-blur-sm">
                        <span className="text-amber-500">
                            Rating:
                        </span>
                        {hospital.rating}
                    </div>

                )}


                {/* DISTANCE BADGE */}

                {distanceKm != null && (
                    <div className="absolute bottom-3 right-3 rounded-full bg-ink-900/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm">
                        {distanceKm < 1
                            ? `${Math.round(distanceKm * 1000)} m away`
                            : `${distanceKm.toFixed(1)} km away`}
                    </div>
                )}


                {/* NAME overlaid at bottom of image */}

                <div className="absolute inset-x-0 bottom-0 p-4">

                    <h3 className="line-clamp-1 text-lg font-bold leading-6 tracking-tight text-white drop-shadow-sm">
                        {hospital.name}
                    </h3>

                    {hospital.city && (

                        <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-white/90 drop-shadow-sm">
                            
                            {hospital.city}
                            {hospital.state
                                ? `, ${hospital.state}`
                                : ""}
                        </p>

                    )}

                </div>

            </div>


            {/* CONTENT */}

            <div className="flex flex-1 flex-col p-5">

                <div className="grid gap-2 text-xs text-ink-600">

                    <Info
                        label="Location"
                        value={hospital.location}
                    />

                    <Info
                        label="Address"
                        value={hospital.address}
                    />

                    <Info
                        label="Phone"
                        value={hospital.phoneNumber}
                    />

                </div>

<div className="mt-4 rounded-xl bg-ink-50 px-3.5 py-2.5">

    <div className="flex items-center justify-between gap-2">

        <span className="text-xs font-medium text-ink-500">
            Consultation fee
        </span>

        <span className="text-sm font-bold text-ink-900">
            {hospital.consultationFee != null
                ? `₹${Number(hospital.consultationFee).toLocaleString("en-IN")}`
                : "Not specified"}
        </span>

    </div>

    {hospital.feeAutoPriced === true && hospital.consultationFee != null && (
        <p className="mt-1 text-xs text-amber-700">
            Estimated fee · Confirm with hospital
        </p>
    )}

</div>


                {hospital.description && (

                    <p className="mt-4 line-clamp-2 text-xs leading-5 text-ink-500">
                        {hospital.description}
                    </p>

                )}


                <div className="mt-auto pt-5">

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onView();
                        }}
                        className="w-full rounded-xl bg-ink-900 px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-brand-500 active:scale-[0.99]"
                    >
                        View Hospital
                    </button>

                </div>

            </div>

        </article>
    );
}


/*
|--------------------------------------------------------------------------
| ADMIN HOSPITAL PAGE
|--------------------------------------------------------------------------
*/

function AdminHospitalsPage({
    filteredHospitals,
    hospitalImages,
    loading,
    error,
    search,
    setSearch,
    city,
    setCity,
    hospitalType,
    setHospitalType,
    cities,
    types,
    clearFilters,
    fetchHospitals,
    navigate,
    handleLogout,
    handleHospitalView,
    handleHospitalEdit
}) {

    return (

        <div className="min-h-screen bg-ink-50 text-ink-900">


            {/* ADMIN HEADER */}

            <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-ink-50/90 backdrop-blur-xl">

                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

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


                    <div className="flex items-center gap-4">

                        <div className="hidden text-right sm:block">

                            <p className="text-sm font-semibold text-ink-900">
                                {localStorage.getItem("name") ||
                                    "Admin"}
                            </p>

                            <p className="text-xs text-ink-500">
                                Administrator
                            </p>

                        </div>


                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">
                            A
                        </div>


                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-xl border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium text-ink-700 transition hover:border-ink-300 hover:bg-ink-100"
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </header>


            {/* ADMIN MAIN */}

            <main className="mx-auto max-w-7xl px-6 py-10">

                <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

                    <div>

                        <span className="text-sm font-semibold text-brand-600">
                            Hospital Management
                        </span>

                        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink-900">
                            Hospitals
                        </h1>

                        <p className="mt-3 max-w-2xl text-base leading-7 text-ink-500">
                            Manage hospitals, locations, images,
                            healthcare services and pricing.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/hospitals/add"
                            )
                        }
                        className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.98]"
                    >
                        + Add Hospital
                    </button>

                </div>


                {/* ADMIN FILTERS */}

                <div className="mb-8 rounded-3xl border border-ink-200 bg-white p-6 shadow-sm">

                    <div className="grid gap-4 md:grid-cols-4">

                        <div>

                            <label className="mb-2 block text-sm font-medium text-ink-700">
                                Search
                            </label>

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search hospitals..."
                                className="h-12 w-full rounded-xl border border-ink-200 px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                            />

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-medium text-ink-700">
                                City
                            </label>

                            <select
                                value={city}
                                onChange={(event) =>
                                    setCity(
                                        event.target.value
                                    )
                                }
                                className="h-12 w-full rounded-xl border border-ink-200 bg-white px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                            >

                                <option value="">
                                    All cities
                                </option>

                                {cities.map(
                                    currentCity => (

                                        <option
                                            key={currentCity}
                                            value={currentCity}
                                        >
                                            {currentCity}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-medium text-ink-700">
                                Hospital type
                            </label>

                            <select
                                value={hospitalType}
                                onChange={(event) =>
                                    setHospitalType(
                                        event.target.value
                                    )
                                }
                                className="h-12 w-full rounded-xl border border-ink-200 bg-white px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                            >

                                <option value="">
                                    All types
                                </option>

                                {types.map(
                                    type => (

                                        <option
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        <button
                            type="button"
                            onClick={clearFilters}
                            className="self-end rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-medium text-ink-700 transition hover:bg-ink-100"
                        >
                            Clear Filters
                        </button>

                    </div>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={fetchHospitals}
                            className="font-semibold underline"
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* LOADING */}

                {loading && (

                    <div className="rounded-3xl border border-ink-200 bg-white p-16 text-center shadow-sm">

                        <div className="mx-auto mb-5 h-9 w-9 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />

                        <p className="text-sm text-ink-500">
                            Loading hospitals...
                        </p>

                    </div>

                )}


                {/* EMPTY */}

                {!loading &&
                    !error &&
                    filteredHospitals.length === 0 && (

                        <div className="rounded-3xl border border-dashed border-ink-300 bg-white p-16 text-center">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-3xl">
                                Hospital
                            </div>

                            <h2 className="mt-6 text-2xl font-semibold">
                                No hospitals yet
                            </h2>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-500">
                                Add your first hospital to start
                                managing services and pricing.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/admin/hospitals/add"
                                    )
                                }
                                className="mt-6 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                            >
                                + Add Hospital
                            </button>

                        </div>

                    )}


                {/* ADMIN HOSPITAL LIST */}

                {!loading &&
                    filteredHospitals.length > 0 && (

                        <div className="space-y-5">

                            {filteredHospitals.map(
                                hospital => (

                                    <AdminHospitalCard
                                        key={hospital.id}
                                        hospital={hospital}
                                        primaryImage={
                                            hospitalImages[
                                                hospital.id
                                            ]
                                        }
                                        onView={() =>
                                            handleHospitalView(
                                                hospital.id
                                            )
                                        }
                                        onEdit={() =>
                                            handleHospitalEdit(
                                                hospital.id
                                            )
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

            </main>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| ADMIN HOSPITAL CARD
|--------------------------------------------------------------------------
*/

function AdminHospitalCard({
    hospital,
    primaryImage,
    onView,
    onEdit
}) {

    const rawImageUrl =
        primaryImage ||
        hospital.imageUrl ||
        null;


    const imageUrl =
        rawImageUrl
            ? rawImageUrl.startsWith("http")
                ? rawImageUrl
                : `${API_URL}${rawImageUrl}`
            : null;


    return (

        <article className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-sm transition hover:border-ink-300 hover:shadow-md">

            <div className="flex flex-col lg:flex-row">


                {/* IMAGE */}

                <div className="h-56 w-full shrink-0 bg-ink-100 lg:h-auto lg:w-80">

                    {imageUrl ? (

                        <img
                            src={imageUrl}
                            alt={
                                hospital.name ||
                                "Hospital"
                            }
                            className="h-full min-h-56 w-full object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(event) =>
                                handleHospitalImageError(
                                    event,
                                    hospital?.id
                                )
                            }
                        />

                    ) : null}


                    <div
                        data-image-fallback
                        className={`${
                            imageUrl
                                ? "hidden"
                                : ""
                        } flex h-full min-h-56 items-center justify-center text-5xl`}
                    >
                        Hospital
                    </div>

                </div>


                {/* CONTENT */}

                <div className="min-w-0 flex-1 p-7">

                    <div className="flex flex-col justify-between gap-6 sm:flex-row">


                        <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-3">

                                <h2 className="text-2xl font-semibold tracking-tight text-ink-900">
                                    {hospital.name}
                                </h2>

                                {hospital.hospitalType && (

                                    <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                                        {hospital.hospitalType}
                                    </span>

                                )}

                            </div>


                            <div className="mt-5 grid gap-3 text-sm text-ink-600 sm:grid-cols-2">

                                <Info
                                    label="City"
                                    value={hospital.city}
                                />

                                <Info
                                    label="Location"
                                    value={hospital.location}
                                />

                                <Info
                                    label="Phone"
                                    value={hospital.phoneNumber}
                                />

                                <Info
                                    label="Address"
                                    value={hospital.address}
                                />

                                <Info
    label={
        hospital.feeAutoPriced === true
            ? "Estimated consultation fee"
            : "Consultation"
    }
    value={
        hospital.consultationFee != null
            ? `₹${Number(hospital.consultationFee).toLocaleString("en-IN")}`
            : "Not specified"
    }
/>
                                
                                
                                
                                
                                
                                                                    
                                

                                <Info
                                    label="Rating"
                                    value={
                                        hospital.rating !=
                                        null
                                            ? `Rating: ${hospital.rating}`
                                            : "Not rated"
                                    }
                                />

                            </div>


                            {hospital.description && (

                                <p className="mt-5 max-w-3xl text-sm leading-6 text-ink-500">
                                    {hospital.description}
                                </p>

                            )}

                        </div>


                        <div className="flex shrink-0 gap-3 sm:flex-col">

                            <button
                                type="button"
                                onClick={onView}
                                className="rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-100"
                            >
                                View
                            </button>

                            <button
                                type="button"
                                onClick={onEdit}
                                className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                            >
                                Edit
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </article>
    );
}


/*
|--------------------------------------------------------------------------
| SHARED INFO
|--------------------------------------------------------------------------
*/

function Info({
    label,
    value
}) {

    return (

        <div>

            <span className="font-semibold text-ink-900">
                {label}:
            </span>{" "}

            <span>
                {value || "Not available"}
            </span>

        </div>
    );
}


export default Hospitals;