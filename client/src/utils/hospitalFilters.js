/**
 * Single source of truth for hospital search / filter / sort.
 * Used by BOTH Hospitals.jsx and Map.jsx so they can never diverge again.
 */

export function normalizeText(value) {
    return (value ?? "").toString().trim().toLowerCase();
}

/**
 * Every coordinate shape the backend has ever used:
 * latitude/longitude (canonical), lat/lng (legacy), location.{latitude,...}
 */
export function getHospitalCoords(hospital) {
    if (!hospital) return null;

    const lat =
        hospital.latitude ??
        hospital.lat ??
        hospital.location?.latitude ??
        hospital.location?.lat ??
        null;

    const lng =
        hospital.longitude ??
        hospital.lng ??
        hospital.location?.longitude ??
        hospital.location?.lng ??
        null;

    if (lat == null || lng == null || lat === "" || lng === "") return null;

    const numLat = Number(lat);
    const numLng = Number(lng);

    if (!Number.isFinite(numLat) || !Number.isFinite(numLng)) return null;

    return [numLat, numLng];
}

export function haversineKm(lat1, lon1, lat2, lon2) {
    const a1 = Number(lat1);
    const o1 = Number(lon1);
    const a2 = Number(lat2);
    const o2 = Number(lon2);

    if (
        !Number.isFinite(a1) || !Number.isFinite(o1) ||
        !Number.isFinite(a2) || !Number.isFinite(o2)
    ) {
        return null;
    }

    const toRad = (value) => (value * Math.PI) / 180;
    const dLat = toRad(a2 - a1);
    const dLon = toRad(o2 - o1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(a1)) * Math.cos(toRad(a2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function distanceForHospital(hospital, userLocation) {
    if (!userLocation) return null;
    const coords = getHospitalCoords(hospital);
    if (!coords) return null;
    return haversineKm(userLocation[0], userLocation[1], coords[0], coords[1]);
}

/**
 * Search haystack covers every visible field so
 * "Banjara Hills" (locality) works on both pages.
 */
export function matchesSearch(hospital, query) {
    const q = normalizeText(query);
    if (!q) return true;

    const haystack = [
        hospital.name,
        hospital.city,
        hospital.state,
        hospital.address,
        hospital.location,
        hospital.hospitalType,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    // Multi-word queries: every word must match somewhere
    return q.split(/\s+/).every((word) => haystack.includes(word));
}

export function matchesExact(hospitalValue, filterValue) {
    if (!filterValue) return true;
    return normalizeText(hospitalValue) === normalizeText(filterValue);
}

/**
 * Full pipeline shared by Hospitals + Map:
 * search -> city -> state -> type -> nearby -> nearest-first sort.
 * Returns hospitals with _distanceKm attached (null when unknown).
 */
export function filterAndSortHospitals(
    hospitals,
    {
        search = "",
        city = "",
        stateFilter = "",
        hospitalType = "",
        nearbyOnly = false,
        radiusKm = 25,
        userLocation = null,
    } = {}
) {
    const list = Array.isArray(hospitals) ? hospitals : [];

    const withDistance = list.map((hospital) => ({
        hospital,
        distanceKm: distanceForHospital(hospital, userLocation),
    }));

    const filtered = withDistance.filter(({ hospital, distanceKm }) => {
        if (!matchesSearch(hospital, search)) return false;
        if (!matchesExact(hospital.city, city)) return false;
        if (!matchesExact(hospital.state, stateFilter)) return false;
        if (!matchesExact(hospital.hospitalType, hospitalType)) return false;

        if (nearbyOnly && userLocation) {
            if (distanceKm == null || distanceKm > radiusKm) return false;
        }

        return true;
    });

    // Nearest first whenever location is known (nulls last, stable)
    if (userLocation) {
        filtered.sort((a, b) => {
            if (a.distanceKm == null) return 1;
            if (b.distanceKm == null) return -1;
            return a.distanceKm - b.distanceKm;
        });
    }

    return filtered.map((entry) => ({
        ...entry.hospital,
        _distanceKm: entry.distanceKm,
    }));
}
