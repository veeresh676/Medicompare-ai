import { useEffect, useMemo, useState } from "react";
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
    Polyline,
} from "react-leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Navbar from "../components/Navbar";
import api from "../api/api";
import {
    distanceForHospital as sharedDistance,
    filterAndSortHospitals,
    getHospitalCoords,
} from "../utils/hospitalFilters";


// Fix Leaflet marker icons when using Vite.
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


const DEFAULT_CENTER = [20.5937, 78.9629];


// ============================================================
// MAP CONTROLLER
// ============================================================

function MapController({ center, zoom }) {

    const map = useMap();

    useEffect(() => {

        if (!center) {
            return;
        }

        map.setView(center, zoom, {
            animate: true,
        });

    }, [center, zoom, map]);

    return null;
}


// ============================================================
// FIT ROUTE
// ============================================================

function RouteBounds({ routeCoordinates }) {

    const map = useMap();

    useEffect(() => {

        if (
            !routeCoordinates ||
            routeCoordinates.length === 0
        ) {
            return;
        }

        const bounds =
            L.latLngBounds(routeCoordinates);

        map.fitBounds(bounds, {
            padding: [50, 50],
            animate: true,
        });

    }, [routeCoordinates, map]);

    return null;
}


// ============================================================
// COORDINATES
// ============================================================

function getCoordinates(hospital) {
    return getHospitalCoords(hospital);
}


// ============================================================
// GOOGLE DIRECTIONS
// ============================================================

function buildDirectionsUrl(
    hospital,
    userLocation = null
) {

    const destination =
        hospital?.address ||
        hospital?.location ||
        hospital?.city ||
        hospital?.name ||
        "";

    let url =
        "https://www.google.com/maps/dir/?api=1";

    if (userLocation) {

        url +=
            `&origin=${encodeURIComponent(
                `${userLocation[0]},${userLocation[1]}`
            )}`;

    }

    url +=
        `&destination=${encodeURIComponent(
            destination
        )}`;

    return url;
}


// ============================================================
// GEOCODING
// ============================================================

async function geocodeHospital(hospital) {

    const queryParts = [
        hospital?.address,
        hospital?.location,
        hospital?.city,
        "India",
    ].filter(Boolean);

    const query =
        queryParts.join(", ");

    if (!query) {
        throw new Error(
            "Hospital address is unavailable."
        );
    }

    const url =
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
            query
        )}`;

    const response =
        await fetch(url, {
            headers: {
                Accept: "application/json",
            },
        });

    if (!response.ok) {
        throw new Error(
            "Unable to find the hospital location."
        );
    }

    const data =
        await response.json();

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {
        throw new Error(
            "Hospital coordinates could not be found."
        );
    }

    return [
        Number(data[0].lat),
        Number(data[0].lon),
    ];
}


// ============================================================
// ROUTING
// ============================================================

async function calculateRoute(
    userLocation,
    destination
) {

    if (
        !userLocation ||
        !destination
    ) {
        return null;
    }

    const coordinates =
        `${userLocation[1]},${userLocation[0]};${destination[1]},${destination[0]}`;

    const url =
        `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true`;

    const response =
        await fetch(url);

    if (!response.ok) {
        throw new Error(
            "Unable to calculate the driving route."
        );
    }

    const data =
        await response.json();

    if (
        data.code !== "Ok" ||
        !data.routes ||
        data.routes.length === 0
    ) {
        throw new Error(
            "No driving route could be found."
        );
    }

    const route =
        data.routes[0];

    const routeCoordinates =
        route.geometry.coordinates.map(
            ([longitude, latitude]) => [
                latitude,
                longitude,
            ]
        );

    return {
        distanceMeters:
            route.distance,

        durationSeconds:
            route.duration,

        routeCoordinates,

        steps:
            route.legs?.[0]?.steps || [],
    };
}


// ============================================================
// FORMATTERS
// ============================================================

function formatDistance(meters) {

    if (
        meters === null ||
        meters === undefined
    ) {
        return "—";
    }

    if (meters < 1000) {

        return `${Math.round(meters)} m`;

    }

    return `${(meters / 1000).toFixed(1)} km`;
}


function formatDuration(seconds) {

    if (
        seconds === null ||
        seconds === undefined
    ) {
        return "—";
    }

    const minutes =
        Math.round(seconds / 60);

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours =
        Math.floor(minutes / 60);

    const remainingMinutes =
        minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
}


function formatInstruction(step) {

    const maneuver =
        step?.maneuver;

    const type =
        maneuver?.type;

    const modifier =
        maneuver?.modifier;

    const street =
        step?.name;

    let action = "";

    if (type === "depart") {
        action = "Start your journey";
    } else if (type === "arrive") {
        action = "Arrive at your destination";
    } else if (type === "turn") {
        action =
            modifier
                ? `Turn ${modifier}`
                : "Turn";
    } else if (type === "new name") {
        action = "Continue";
    } else if (type === "merge") {
        action =
            modifier
                ? `Merge ${modifier}`
                : "Merge";
    } else if (type === "on ramp") {
        action = "Take the ramp";
    } else if (type === "off ramp") {
        action = "Take the exit ramp";
    } else if (type === "fork") {
        action =
            modifier
                ? `Keep ${modifier} at the fork`
                : "Continue at the fork";
    } else if (type === "roundabout") {
        action = "Enter the roundabout";
    } else {
        action = "Continue";
    }

    if (
        street &&
        type !== "arrive"
    ) {
        return `${action} onto ${street}`;
    }

    return action;
}


// ============================================================
// MAP COMPONENT
// ============================================================

function Map() {

    const navigate = useNavigate();

    const location =
        useLocation();

    const passedHospital =
        location.state?.hospital || null;


    const [
        hospitals,
        setHospitals
    ] = useState([]);


    const [
        selectedHospital,
        setSelectedHospital
    ] = useState(
        passedHospital
    );


    const [
        userLocation,
        setUserLocation
    ] = useState(null);


    const [
        destinationCoordinates,
        setDestinationCoordinates
    ] = useState(
        passedHospital
            ? getCoordinates(passedHospital)
            : null
    );


    const [
        route,
        setRoute
    ] = useState(null);


    const [
        search,
        setSearch
    ] = useState("");


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        locationLoading,
        setLocationLoading
    ] = useState(false);


    const [
        routeLoading,
        setRouteLoading
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        routeError,
        setRouteError
    ] = useState("");


    // ========================================================
    // LOAD HOSPITALS
    // ========================================================

    useEffect(() => {

        async function loadHospitals() {

            try {

                setLoading(true);
                setError("");

                const response =
    await api.get(
        "/hospitals?size=200"
    );

                const data =
                    Array.isArray(response.data)
                        ? response.data
                        : response.data?.content || [];

                setHospitals(data);

            } catch (err) {

                console.error(
                    "Failed to load hospitals:",
                    err
                );

                setError(
                    "Unable to load hospitals. Please make sure the backend is running."
                );

            } finally {

                setLoading(false);

            }
        }

        loadHospitals();

    }, []);


    // ========================================================
    // SELECT HOSPITAL PASSED FROM DETAILS PAGE
    // ========================================================

    useEffect(() => {

        if (!passedHospital) {
            return;
        }

        setSelectedHospital(
            passedHospital
        );

        const coordinates =
            getCoordinates(
                passedHospital
            );

        if (coordinates) {

            setDestinationCoordinates(
                coordinates
            );

        }

    }, [passedHospital]);


    const [nearbyOnly, setNearbyOnly] = useState(false);
    const [radiusKm, setRadiusKm] = useState(25);

    function distanceForHospital(hospital) {
        return sharedDistance(hospital, userLocation);
    }

    // ========================================================
    // FILTER (search + nearby, nearest first when located)
    // Shared with Hospitals.jsx so behaviour is identical.
    // ========================================================

    const filteredHospitals = useMemo(() => {
        return filterAndSortHospitals(hospitals, {
            search,
            nearbyOnly,
            radiusKm,
            userLocation,
        });
    }, [hospitals, search, nearbyOnly, radiusKm, userLocation]);

    // ========================================================
    // HOSPITALS WITH COORDINATES (markers follow list filters)
    // ========================================================

    /*
     * Markers follow the SAME filters as the list (search + nearby),
     * so the map and the list can never disagree again.
     */
    const hospitalsWithCoordinates = useMemo(() => {
        return filteredHospitals
            .map((hospital) => ({
                ...hospital,
                coordinates: getCoordinates(hospital),
            }))
            .filter((hospital) => hospital.coordinates !== null);
    }, [filteredHospitals]);


    // ========================================================
    // MAP CENTER
    // ========================================================

    const mapCenter =
        destinationCoordinates ||
        userLocation ||
        DEFAULT_CENTER;


    // ========================================================
    // REQUEST USER LOCATION
    // ========================================================

    function requestUserLocation() {

        if (!navigator.geolocation) {

            setError(
                "Geolocation is not supported by your browser."
            );

            return;

        }

        setLocationLoading(true);
        setRouteError("");
        setError("");

        navigator.geolocation.getCurrentPosition(

            async (position) => {

                const currentLocation = [
                    position.coords.latitude,
                    position.coords.longitude,
                ];

                setUserLocation(
                    currentLocation
                );

                // Same as Hospitals page: enabling location turns on nearby filtering
                setNearbyOnly(true);

                setLocationLoading(false);

                /*
                 * If a hospital is already selected,
                 * immediately calculate the route.
                 */
                if (
                    selectedHospital
                ) {

                    await calculateHospitalRoute(
                        selectedHospital,
                        currentLocation
                    );

                }

            },

            (locationError) => {

                console.error(
                    "Location error:",
                    locationError
                );

                setLocationLoading(false);

                setError(
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


    // ========================================================
    // CALCULATE HOSPITAL ROUTE
    // ========================================================

    async function calculateHospitalRoute(
        hospital,
        currentLocation = userLocation
    ) {

        if (!hospital) {
            return;
        }

        setRouteError("");
        setRoute(null);
        setRouteLoading(true);

        try {

            let coordinates =
                getCoordinates(hospital);

            /*
             * If the database does not contain coordinates,
             * find them from the hospital address.
             */
            if (!coordinates) {

                coordinates =
                    await geocodeHospital(
                        hospital
                    );

            }

            setDestinationCoordinates(
                coordinates
            );

            /*
             * We need the user's location
             * before calculating driving distance.
             */
            if (!currentLocation) {

                setRouteLoading(false);

                return;

            }

            const calculatedRoute =
                await calculateRoute(
                    currentLocation,
                    coordinates
                );

            setRoute(
                calculatedRoute
            );

        } catch (err) {

            console.error(
                "Route calculation failed:",
                err
            );

            setRouteError(
                err.message ||
                    "Unable to calculate the route."
            );

        } finally {

            setRouteLoading(false);

        }
    }


    // ========================================================
    // HOSPITAL SELECT
    // ========================================================

    async function handleHospitalSelect(
        hospital
    ) {

        setSelectedHospital(
            hospital
        );

        setRoute(null);
        setRouteError("");

        const coordinates =
            getCoordinates(hospital);

        if (coordinates) {

            setDestinationCoordinates(
                coordinates
            );

        }

        /*
         * If we already know the user's location,
         * calculate immediately.
         */
        if (userLocation) {

            await calculateHospitalRoute(
                hospital,
                userLocation
            );

        }

    }


    // ========================================================
    // AUTOMATIC ROUTE FROM DETAILS PAGE
    // ========================================================

    useEffect(() => {

        if (
            !passedHospital ||
            !userLocation
        ) {
            return;
        }

        calculateHospitalRoute(
            passedHospital,
            userLocation
        );

    }, [userLocation]);


    return (

        <div className="min-h-screen bg-ink-50">

            <Navbar />


            <main className="mx-auto max-w-7xl px-6 py-8">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-8">

                    <div className="mb-2 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                        MediCompare Maps
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-ink-900">
                        Find Hospitals Near You
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500">
                        Explore hospitals, calculate driving
                        distance and estimated travel time,
                        and get directions from your location.
                    </p>

                </div>


                {/* =================================================
                    ERRORS
                ================================================= */}

                {error && (

                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                        {error}
                    </div>

                )}


                <div className="grid gap-6 lg:grid-cols-[360px_1fr]">


                    {/* =================================================
                        HOSPITAL LIST
                    ================================================= */}

                    <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-sm">

                        <div className="mb-5">

                            <label className="mb-2 block text-sm font-semibold text-ink-800">
                                Search hospitals
                            </label>

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search hospital, city, state or address..."
                                className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                            />

                        </div>


                        {userLocation && (
                            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-ink-50 p-3">
                                <label className="flex items-center gap-2 text-xs font-semibold text-ink-700">
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

                                <select
                                    value={radiusKm}
                                    onChange={(event) =>
                                        setRadiusKm(
                                            Number(event.target.value)
                                        )
                                    }
                                    className="rounded-xl border border-ink-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-brand-400"
                                >
                                    <option value={10}>10 km</option>
                                    <option value={25}>25 km</option>
                                    <option value={50}>50 km</option>
                                    <option value={100}>100 km</option>
                                    <option value={300}>300 km</option>
                                </select>

                                <span className="text-[11px] text-ink-500">
                                    Sorted nearest first
                                </span>
                            </div>
                        )}


                        <div className="mb-4 flex items-center justify-between">

                            <span className="text-sm font-semibold text-ink-800">
                                Hospitals
                            </span>

                            <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-600">
                                {filteredHospitals.length}
                            </span>

                        </div>


                        {loading ? (

                            <div className="py-10 text-center text-sm text-ink-500">
                                Loading hospitals...
                            </div>

                        ) : filteredHospitals.length === 0 ? (

                            <div className="rounded-2xl bg-ink-50 px-4 py-8 text-center">

                                <div className="text-sm font-semibold text-ink-800">
                                    No hospitals found
                                </div>

                                <p className="mt-1 text-xs text-ink-500">
                                    Try a different search term.
                                </p>

                            </div>

                        ) : (

                            <div className="max-h-[620px] space-y-3 overflow-y-auto pr-1">

                                {filteredHospitals.map(
                                    (hospital) => {

                                        const coordinates =
                                            getCoordinates(
                                                hospital
                                            );

                                        const isSelected =
                                            selectedHospital?.id ===
                                            hospital.id;

                                        const distanceKm =
                                            distanceForHospital(
                                                hospital
                                            );

                                        return (

                                            <button
                                                key={
                                                    hospital.id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    handleHospitalSelect(
                                                        hospital
                                                    )
                                                }
                                                className={`w-full rounded-2xl border p-4 text-left transition ${
                                                    isSelected
                                                        ? "border-brand-400 bg-brand-50 shadow-sm"
                                                        : "border-ink-200 bg-white hover:border-brand-200 hover:bg-ink-50"
                                                }`}
                                            >

                                                <div className="flex items-start justify-between gap-3">

                                                    <div className="min-w-0">

                                                        <h3 className="truncate text-sm font-semibold text-ink-900">
                                                            {hospital.name ||
                                                                "Unnamed Hospital"}
                                                        </h3>

                                                        <p className="mt-1 text-xs text-ink-500">
                                                            {[
                                                                hospital.city,
                                                                hospital.state,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(", ") ||
                                                                hospital.address ||
                                                                "Location unavailable"}
                                                        </p>

                                                        {distanceKm != null && (
                                                            <p className="mt-1 text-[11px] font-bold text-brand-600">
                                                                {distanceKm < 1
                                                                    ? `${Math.round(distanceKm * 1000)} m away`
                                                                    : `${distanceKm.toFixed(1)} km away`}
                                                            </p>
                                                        )}

                                                    </div>


                                                    {coordinates ? (

                                                        <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700">
                                                            On map
                                                        </span>

                                                    ) : (

                                                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">
                                                            Address only
                                                        </span>

                                                    )}

                                                </div>


                                                {hospital.rating !== undefined &&
                                                    hospital.rating !== null && (

                                                        <div className="mt-3 text-xs font-medium text-ink-600">
                                                            ★{" "}
                                                            {
                                                                hospital.rating
                                                            }
                                                        </div>

                                                    )}

                                            </button>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </section>


                    {/* =================================================
                        MAP
                    ================================================= */}

                    <section className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-sm">

                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 px-5 py-4">

                            <div>

                                <h2 className="text-base font-semibold text-ink-900">
                                    Hospital Map
                                </h2>

                                <p className="mt-1 text-xs text-ink-500">

                                    {hospitalsWithCoordinates.length}
                                    {" "}
                                    hospitals currently mapped

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    requestUserLocation
                                }
                                disabled={
                                    locationLoading
                                }
                                className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {locationLoading
                                    ? "Finding you..."
                                    : "📍 Use my location"}

                            </button>

                        </div>


                        <div className="h-[650px]">

                            <MapContainer
                                center={
                                    mapCenter
                                }
                                zoom={5}
                                scrollWheelZoom={
                                    true
                                }
                                className="h-full w-full"
                            >

                                <TileLayer
                                    attribution='&copy; OpenStreetMap contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />


                                <MapController
                                    center={
                                        mapCenter
                                    }
                                    zoom={
                                        destinationCoordinates ||
                                        userLocation
                                            ? 13
                                            : 5
                                    }
                                />


                                {route?.routeCoordinates && (

                                    <RouteBounds
                                        routeCoordinates={
                                            route.routeCoordinates
                                        }
                                    />

                                )}


                                {/* USER */}

                                {userLocation && (

                                    <Marker
                                        position={
                                            userLocation
                                        }
                                    >

                                        <Popup>

                                            <div className="text-sm">

                                                <strong>
                                                    📍 Your Location
                                                </strong>

                                                <p className="mt-1 text-xs text-ink-500">
                                                    Starting point
                                                </p>

                                            </div>

                                        </Popup>

                                    </Marker>

                                )}


                                {/* HOSPITAL MARKERS */}

                                {hospitalsWithCoordinates.map(
                                    (hospital) => (

                                        <Marker
                                            key={
                                                hospital.id
                                            }
                                            position={
                                                hospital.coordinates
                                            }
                                        >

                                            <Popup>

                                                <div className="min-w-[220px]">

                                                    <h3 className="text-sm font-bold text-ink-900">
                                                        {hospital.name ||
                                                            "Hospital"}
                                                    </h3>


                                                    {hospital.city && (

                                                        <p className="mt-1 text-xs text-ink-500">
                                                            {
                                                                hospital.city
                                                            }
                                                        </p>

                                                    )}


                                                    {hospital.address && (

                                                        <p className="mt-2 text-xs text-ink-600">
                                                            {
                                                                hospital.address
                                                            }
                                                        </p>

                                                    )}


                                                    <div className="mt-4 flex gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/hospitals/${hospital.id}`,
                                                                    {
                                                                        state: {
                                                                            hospital,
                                                                        },
                                                                    }
                                                                )
                                                            }
                                                            className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white"
                                                        >
                                                            View
                                                        </button>


                                                        <a
                                                            href={buildDirectionsUrl(
                                                                hospital,
                                                                userLocation
                                                            )}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="rounded-lg border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-700"
                                                        >
                                                            Google Maps
                                                        </a>

                                                    </div>

                                                </div>

                                            </Popup>

                                        </Marker>

                                    )
                                )}


                                {/* SELECTED HOSPITAL WITHOUT
                                    DATABASE COORDINATES */}

                                {selectedHospital &&
                                    destinationCoordinates &&

                                    !hospitalsWithCoordinates.some(
                                        hospital =>
                                            hospital.id ===
                                            selectedHospital.id
                                    ) && (

                                        <Marker
                                            position={
                                                destinationCoordinates
                                            }
                                        >

                                            <Popup>

                                                <strong>
                                                    🏥{" "}
                                                    {
                                                        selectedHospital.name
                                                    }
                                                </strong>

                                            </Popup>

                                        </Marker>

                                    )
                                }


                                {/* ROUTE */}

                                {route?.routeCoordinates && (

                                    <Polyline
                                        positions={
                                            route.routeCoordinates
                                        }
                                        pathOptions={{
                                            color: "#e76f51",
                                            weight: 6,
                                            opacity: 0.85,
                                        }}
                                    />

                                )}

                            </MapContainer>

                        </div>

                    </section>

                </div>


                {/* =================================================
                    SELECTED HOSPITAL + ROUTE
                ================================================= */}

                {selectedHospital && (

                    <section className="mt-6 rounded-3xl border border-ink-200 bg-white p-6 shadow-sm">

                        <div className="flex flex-col gap-6">

                            {/* HEADER */}

                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                                <div>

                                    <div className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                                        Selected Hospital
                                    </div>

                                    <h2 className="mt-1 text-xl font-bold text-ink-900">
                                        {
                                            selectedHospital.name ||
                                            "Hospital"
                                        }
                                    </h2>

                                    <p className="mt-1 text-sm text-ink-500">
                                        {
                                            selectedHospital.address ||
                                            selectedHospital.city ||
                                            "Address unavailable"
                                        }
                                    </p>

                                </div>


                                <div className="flex flex-wrap gap-3">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/hospitals/${selectedHospital.id}`,
                                                {
                                                    state: {
                                                        hospital:
                                                            selectedHospital,
                                                    },
                                                }
                                            )
                                        }
                                        className="rounded-xl border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
                                    >
                                        View Hospital
                                    </button>


                                    <a
                                        href={buildDirectionsUrl(
                                            selectedHospital,
                                            userLocation
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink-800"
                                    >
                                        Open in Google Maps
                                    </a>

                                </div>

                            </div>


                            {/* LOCATION REQUIREMENT */}

                            {!userLocation && (

                                <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">

                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                        <div>

                                            <h3 className="font-bold text-ink-900">
                                                Want distance and travel time?
                                            </h3>

                                            <p className="mt-1 text-sm leading-6 text-ink-600">
                                                Allow location access so MediCompare
                                                can calculate the driving route from
                                                your current location to this hospital.
                                            </p>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={
                                                requestUserLocation
                                            }
                                            disabled={
                                                locationLoading
                                            }
                                            className="shrink-0 rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
                                        >
                                            {locationLoading
                                                ? "Finding you..."
                                                : "📍 Calculate Route"}
                                        </button>

                                    </div>

                                </div>

                            )}


                            {/* ROUTE LOADING */}

                            {routeLoading && (

                                <div className="rounded-2xl border border-ink-200 bg-ink-50 p-6 text-center">

                                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />

                                    <p className="mt-3 text-sm font-semibold text-ink-700">
                                        Calculating the best driving route...
                                    </p>

                                </div>

                            )}


                            {/* ROUTE ERROR */}

                            {routeError && (

                                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

                                    <p className="text-sm font-semibold text-red-800">
                                        {routeError}
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-red-700">
                                        You can still open Google Maps
                                        for navigation.
                                    </p>

                                </div>

                            )}


                            {/* ROUTE RESULT */}

                            {route && !routeLoading && (

                                <div>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                                        <div className="rounded-2xl bg-brand-50 p-5">

                                            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                                                Distance
                                            </p>

                                            <p className="mt-2 text-2xl font-bold text-ink-900">
                                                {formatDistance(
                                                    route.distanceMeters
                                                )}
                                            </p>

                                        </div>


                                        <div className="rounded-2xl bg-brand-50 p-5">

                                            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                                                Estimated time
                                            </p>

                                            <p className="mt-2 text-2xl font-bold text-ink-900">
                                                {formatDuration(
                                                    route.durationSeconds
                                                )}
                                            </p>

                                        </div>


                                        <div className="rounded-2xl bg-ink-50 p-5">

                                            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                                                Route
                                            </p>

                                            <p className="mt-2 text-2xl font-bold text-ink-900">
                                                🚗 Driving
                                            </p>

                                        </div>


                                        <div className="rounded-2xl bg-ink-50 p-5">

                                            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                                                Destination
                                            </p>

                                            <p className="mt-2 truncate text-sm font-bold text-ink-900">
                                                {
                                                    selectedHospital.name
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    {/* TURN BY TURN */}

                                    {route.steps &&
                                        route.steps.length >
                                            0 && (

                                            <div className="mt-6">

                                                <div className="mb-4">

                                                    <h3 className="text-lg font-bold text-ink-900">
                                                        Driving directions
                                                    </h3>

                                                    <p className="mt-1 text-sm text-ink-500">
                                                        Route instructions from
                                                        your current location.
                                                    </p>

                                                </div>


                                                <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">

                                                    {route.steps
                                                        .filter(
                                                            (
                                                                step
                                                            ) =>
                                                                step?.maneuver
                                                        )
                                                        .map(
                                                            (
                                                                step,
                                                                index
                                                            ) => (

                                                                <div
                                                                    key={
                                                                        index
                                                                    }
                                                                    className="flex gap-4 rounded-xl border border-ink-100 bg-ink-50 p-4"
                                                                >

                                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-600 shadow-sm">
                                                                        {index +
                                                                            1}
                                                                    </div>


                                                                    <div className="min-w-0">

                                                                        <p className="text-sm font-semibold text-ink-800">
                                                                            {formatInstruction(
                                                                                step
                                                                            )}
                                                                        </p>

                                                                        {step.distance !==
                                                                            undefined && (

                                                                            <p className="mt-1 text-xs text-ink-500">
                                                                                {formatDistance(
                                                                                    step.distance
                                                                                )}
                                                                            </p>

                                                                        )}

                                                                    </div>

                                                                </div>

                                                            )
                                                        )}

                                                </div>

                                            </div>

                                        )}

                                </div>

                            )}

                        </div>

                    </section>

                )}

            </main>

        </div>
    );
}


export default Map;