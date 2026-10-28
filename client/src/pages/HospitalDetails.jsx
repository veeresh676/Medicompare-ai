import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import api from "../api/api";
import { API_BASE_URL as API_URL } from "../config";
import { handleHospitalImageError } from "../utils/hospitalImage";

function HospitalDetails() {

    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const passedHospital =
        location.state?.hospital || null;


    const [hospital, setHospital] =
        useState(passedHospital);

    const [services, setServices] =
        useState([]);

    const [primaryImage, setPrimaryImage] =
        useState(null);

    const [favourite, setFavourite] =
        useState(false);


    const [loading, setLoading] =
        useState(!passedHospital);

    const [servicesLoading, setServicesLoading] =
        useState(true);

    const [imageLoading, setImageLoading] =
        useState(true);

    const [favouriteLoading, setFavouriteLoading] =
        useState(false);


    const [error, setError] =
        useState("");

    const [favouriteError, setFavouriteError] =
        useState("");


    /*
     * =====================================================
     * REVIEWS STATE
     * =====================================================
     */

    const [reviews, setReviews] =
        useState([]);

    const [reviewSummary, setReviewSummary] =
        useState(null);

    const [reviewsLoading, setReviewsLoading] =
        useState(true);

    const [reviewForm, setReviewForm] =
        useState({ rating: 5, comment: "" });

    const [reviewSubmitting, setReviewSubmitting] =
        useState(false);

    const [reviewError, setReviewError] =
        useState("");

    const [reviewSuccess, setReviewSuccess] =
        useState("");


    useEffect(() => {

        loadHospital();
        loadReviews();

    }, [id]);


    async function loadHospital() {

        try {

            setError("");


            /*
             * -------------------------------------------------------
             * HOSPITAL
             * -------------------------------------------------------
             */

            if (passedHospital) {

                setHospital(passedHospital);
                setLoading(false);

            } else {

                setLoading(true);

                const response =
                    await api.get(
                        `/hospitals/${id}`
                    );

                setHospital(response.data);
                setLoading(false);
            }


            /*
             * -------------------------------------------------------
             * PRIMARY IMAGE
             * -------------------------------------------------------
             */

            try {

                setImageLoading(true);

                const imageResponse =
                    await fetch(
                        `${API_URL}/api/hospitals/${id}/images/primary`
                    );


                if (
                    imageResponse.status === 204 ||
                    imageResponse.status === 404
                ) {

                    setPrimaryImage(null);

                } else if (imageResponse.ok) {

                    const image =
                        await imageResponse.json();

                    setPrimaryImage(
                        image?.imageUrl || null
                    );

                } else {

                    setPrimaryImage(null);
                }

            } catch (imageError) {

                console.warn(
                    "Unable to load hospital primary image:",
                    imageError
                );

                setPrimaryImage(null);

            } finally {

                setImageLoading(false);
            }


            /*
             * -------------------------------------------------------
             * SERVICES
             * -------------------------------------------------------
             */

            try {

                setServicesLoading(true);

                const servicesResponse =
                    await api.get(
                        `/hospitals/${id}/services`
                    );

                setServices(
                    Array.isArray(
                        servicesResponse.data
                    )
                        ? servicesResponse.data
                        : []
                );

            } catch (servicesError) {

                console.warn(
                    "Unable to load hospital services:",
                    servicesError
                );

                setServices([]);

            } finally {

                setServicesLoading(false);
            }


            /*
             * -------------------------------------------------------
             * HISTORY
             * -------------------------------------------------------
             */

            try {

                await api.post(
                    `/user/history/${id}`
                );

            } catch (historyError) {

                console.warn(
                    "Unable to record hospital history:",
                    historyError
                );
            }


            /*
             * -------------------------------------------------------
             * FAVOURITE STATUS
             * -------------------------------------------------------
             */

            try {

                const favouriteResponse =
                    await api.get(
                        `/user/favourites/${id}`
                    );

                setFavourite(
                    favouriteResponse.data?.favourite === true
                );

            } catch (favouriteStatusError) {

                console.warn(
                    "Unable to load favourite status:",
                    favouriteStatusError
                );

                setFavourite(false);
            }


        } catch (err) {

            console.error(
                "Failed to load hospital:",
                err
            );

            setLoading(false);

            if (err.response?.status === 404) {

                setError(
                    "Hospital not found."
                );

            } else {

                setError(
                    "Unable to load hospital details."
                );
            }
        }
    }


    /*
     * =====================================================
     * LOAD REVIEWS + SUMMARY
     * =====================================================
     */

    async function loadReviews() {

        try {

            setReviewsLoading(true);

            const [reviewsResponse, summaryResponse] =
                await Promise.all([
                    api.get(`/reviews/hospital/${id}`),
                    api.get(`/reviews/hospital/${id}/summary`)
                ]);

            setReviews(
                Array.isArray(reviewsResponse.data)
                    ? reviewsResponse.data
                    : []
            );

            setReviewSummary(summaryResponse.data || null);

        } catch (reviewsError) {

            console.warn(
                "Unable to load reviews:",
                reviewsError
            );

            setReviews([]);
            setReviewSummary(null);

        } finally {

            setReviewsLoading(false);
        }
    }


    /*
     * =====================================================
     * SUBMIT REVIEW
     * =====================================================
     */

    async function handleReviewSubmit(event) {

        event.preventDefault();

        setReviewError("");
        setReviewSuccess("");

        if (!reviewForm.comment.trim()
                || reviewForm.comment.trim().length < 5) {

            setReviewError(
                "Please write at least 5 characters."
            );

            return;
        }

        try {

            setReviewSubmitting(true);

            await api.post(
                `/reviews/hospital/${id}`,
                {
                    hospitalId: Number(id),
                    rating: Number(reviewForm.rating),
                    comment: reviewForm.comment.trim()
                }
            );

            setReviewForm({ rating: 5, comment: "" });
            setReviewSuccess("Thank you! Your review has been posted.");

            await loadReviews();

        } catch (err) {

            console.error(
                "Failed to submit review:",
                err
            );

            if (err.response?.status === 401) {

                setReviewError(
                    "Please log in to write a review."
                );

            } else {

                setReviewError(
                    err.response?.data?.message ||
                    "Unable to submit your review. Please try again."
                );
            }

        } finally {

            setReviewSubmitting(false);
        }
    }


    async function toggleFavourite() {

        try {

            setFavouriteLoading(true);
            setFavouriteError("");


            if (favourite) {

                await api.delete(
                    `/user/favourites/${id}`
                );

                setFavourite(false);

            } else {

                await api.post(
                    `/user/favourites/${id}`
                );

                setFavourite(true);
            }

        } catch (err) {

            console.error(
                "Unable to update favourite:",
                err
            );


            if (err.response?.status === 401) {

                setFavouriteError(
                    "Please log in to save hospitals."
                );

            } else {

                setFavouriteError(
                    "Unable to update saved hospital."
                );
            }

        } finally {

            setFavouriteLoading(false);
        }
    }


    function handleBooking() {

        navigate(
            "/booking",
            {
                state: {
                    hospital
                }
            }
        );
    }


    function handleMap() {

        navigate(
            "/map",
            {
                state: {
                    hospital
                }
            }
        );
    }


    if (loading) {

        return <HospitalDetailsSkeleton />;
    }


    if (error || !hospital) {

        return (

            <div className="min-h-screen bg-[#faf9f7] text-ink-900">

                <Navbar />

                <main className="mx-auto max-w-4xl px-6 py-16">

                    <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-2xl font-bold text-red-700">
                            !
                        </div>

                        <h1 className="mt-5 text-2xl font-semibold text-red-800">
                            {error || "Hospital not found"}
                        </h1>

                        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-red-700/80">
                            We could not load the requested hospital.
                            Please return to the hospital directory
                            and try again.
                        </p>

                        <Link
                            to="/hospitals"
                            className="mt-7 inline-flex rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                        >
                            Browse hospitals
                        </Link>

                    </div>

                </main>

            </div>
        );
    }


    const rating =
        hospital.rating != null
            ? Number(hospital.rating)
            : null;


    /*
     * In-app rating, always visible:
     * live patient-review average when real user reviews exist,
     * otherwise the hospital's MediCompare platform rating.
     * The label always says which one is shown — never mixed.
     */
    const hasPatientReviews =
        (reviewSummary?.totalReviews ?? 0) > 0 &&
        reviewSummary?.averageRating != null;

    const displayedRating = hasPatientReviews
        ? Number(reviewSummary.averageRating)
        : rating;


    const consultationFee =
        hospital.consultationFee != null
            ? Number(hospital.consultationFee)
            : null;


    const availableServices =
        services.filter(
            service =>
                service.available !== false
        );


    /*
     * Uploaded primary image has priority.
     *
     * Existing hospital.imageUrl is the fallback.
     */
   
    const rawDisplayImage =
    primaryImage ||
    hospital.imageUrl ||
    null;

const displayImage =
    rawDisplayImage
        ? rawDisplayImage.startsWith("http")
            ? rawDisplayImage
            : `${API_URL}${rawDisplayImage}`
        : null;


    return (

        <div className="min-h-screen bg-[#faf9f7] text-ink-900">

            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-8">


                {/* =====================================================
                    BACK
                ===================================================== */}

                <Link
                    to="/hospitals"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
                >
                    ← Back to hospitals
                </Link>


                {/* =====================================================
                    HERO
                ===================================================== */}

                <section className="mt-6 overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-sm">

                    <div className="grid lg:grid-cols-[1.15fr_1fr]">


                        {/* =================================================
                            IMAGE
                        ================================================= */}

                        <div className="relative min-h-[360px] bg-ink-100 lg:min-h-[520px]">

                            {imageLoading && !displayImage ? (

                                <div className="flex h-full min-h-[360px] items-center justify-center lg:min-h-[520px]">

                                    <div className="text-center">

                                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />

                                        <p className="mt-3 text-sm text-ink-400">
                                            Loading image...
                                        </p>

                                    </div>

                                </div>

                            ) : displayImage ? (

                                <img
                                    src={displayImage}
                                    alt={
                                        hospital.name ||
                                        "Hospital"
                                    }
                                    className="h-full w-full object-cover"
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


                            {/* IMAGE FALLBACK */}

                            <div
                                data-image-fallback
                                className={`${
                                    displayImage
                                        ? "hidden"
                                        : ""
                                } absolute inset-0 flex min-h-[360px] items-center justify-center text-8xl`}
                            >
                                🏥
                            </div>


                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-7">

                                <div className="flex flex-wrap gap-2">

                                    {hospital.hospitalType && (

                                        <span className="rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-ink-800 shadow-sm">
                                            {hospital.hospitalType}
                                        </span>

                                    )}

                                    {hospital.city && (

                                        <span className="rounded-full bg-black/50 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                                            📍 {hospital.city}
                                        </span>

                                    )}

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            INFORMATION
                        ================================================= */}

                        <div className="flex flex-col justify-center p-7 sm:p-10">

                            <div className="flex flex-wrap items-center gap-3">

                                {rating !== null ? (

                                    <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2">

                                        <span className="text-lg text-amber-500">
                                            ★
                                        </span>

                                        <span className="text-sm font-bold text-amber-800">
                                            {rating.toFixed(1)}
                                        </span>

                                        <span className="text-xs text-amber-700">
                                            Hospital rating
                                        </span>

                                    </div>

                                ) : (

                                    <span className="rounded-xl bg-ink-50 px-4 py-2 text-sm font-semibold text-ink-500">
                                        Not rated yet
                                    </span>

                                )}

                            </div>


                            <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                                {hospital.name}
                            </h1>


                            {hospital.description && (

                                <p className="mt-5 text-base leading-7 text-ink-500">
                                    {hospital.description}
                                </p>

                            )}


                            {/* QUICK STATS */}

                            <div className="mt-7 grid gap-3 sm:grid-cols-2">

                                <QuickInfo
                                    icon="📍"
                                    label="Location"
                                    value={
                                        hospital.location ||
                                        hospital.address ||
                                        hospital.city ||
                                        "Not available"
                                    }
                                />

                                <QuickInfo
                                    icon="📞"
                                    label="Phone"
                                    value={
                                        hospital.phoneNumber ||
                                        "Not available"
                                    }
                                />
	<QuickInfo
    icon="₹"
    label={
        hospital.feeAutoPriced === true
            ? "Estimated consultation"
            : "Consultation"
    }
    value={
        consultationFee !== null
            ? `₹${consultationFee.toLocaleString("en-IN")}`
            : "Not available"
    }
/>
                                	
                                <QuickInfo
                                    icon="🩺"
                                    label="Services"
                                    value={
                                        servicesLoading
                                            ? "Loading..."
                                            : `${availableServices.length} available`
                                    }
                                />

                            </div>


                            {/* ACTIONS */}

                            <div className="mt-8 grid gap-3 sm:grid-cols-2">

                                <button
                                    type="button"
                                    onClick={handleBooking}
                                    className="rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.99]"
                                >
                                    📅 Book Appointment
                                </button>

                                <Link
                                    to="/compare"
                                    className="rounded-xl border border-ink-200 bg-white px-5 py-3.5 text-center text-sm font-bold text-ink-700 transition hover:border-ink-300 hover:bg-ink-50"
                                >
                                    ⇄ Compare Hospital
                                </Link>

                            </div>


                            <button
                                type="button"
                                onClick={toggleFavourite}
                                disabled={favouriteLoading}
                                className="mt-3 w-full rounded-xl border border-ink-200 bg-white px-5 py-3.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {favouriteLoading
                                    ? "Saving..."
                                    : favourite
                                      ? "♥ Saved to favourites"
                                      : "♡ Save hospital"}
                            </button>


                            {favouriteError && (

                                <p className="mt-3 text-center text-sm text-red-600">
                                    {favouriteError}
                                </p>

                            )}

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    SERVICES
                ===================================================== */}

                <section className="mt-10">

                    <div className="mb-6">

                        <span className="text-sm font-bold text-brand-600">
                            Healthcare services
                        </span>

                        <h2 className="mt-1 text-2xl font-bold tracking-tight">
                            Services & pricing
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-ink-500">
                            Explore the services available at this hospital
                            before booking your appointment.
                        </p>

                    </div>


                    {servicesLoading ? (

                        <div className="rounded-2xl border border-ink-200 bg-white p-10 text-center">

                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />

                            <p className="mt-4 text-sm text-ink-500">
                                Loading services...
                            </p>

                        </div>

                    ) : services.length === 0 ? (

                        <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-10 text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-2xl">
                                🩺
                            </div>

                            <h3 className="mt-4 text-lg font-bold">
                                No services listed
                            </h3>

                            <p className="mt-2 text-sm text-ink-500">
                                Service information has not been added
                                for this hospital yet.
                            </p>

                        </div>

                    ) : (

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                            {services.map(service => (

                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    onBook={handleBooking}
                                />

                            ))}

                        </div>

                    )}

                </section>


                {/* =====================================================
                    RATING & REVIEWS
                ===================================================== */}

                <section className="mt-10">

                    <div className="mb-6">

                        <span className="text-sm font-bold text-brand-600">
                            Patient experience
                        </span>

                        <h2 className="mt-1 text-2xl font-bold tracking-tight">
                            Ratings & reviews
                        </h2>

                            <p className="mt-2 text-sm leading-6 text-ink-500">
                                See what patients have shared about their
                                experience with this hospital.
                            </p>

                        </div>


                    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">


                        {/* =================================================
                            SUMMARY
                        ================================================= */}

                        <div className="rounded-2xl border border-ink-200 bg-white p-7 text-center shadow-sm">

                            <p className="text-sm font-semibold text-ink-500">
                                {hasPatientReviews
                                    ? "Patient rating"
                                    : "MediCompare rating"}
                            </p>

                            <div className="mt-4 text-5xl font-bold text-ink-900">
                                {displayedRating != null
                                    ? displayedRating.toFixed(1)
                                    : "—"}
                            </div>

                            <div className="mt-3 text-xl tracking-widest text-amber-500">
                                {"★".repeat(
                                    Math.round(displayedRating || 0)
                                )}
                                {"☆".repeat(
                                    5 - Math.round(displayedRating || 0)
                                )}
                            </div>

                            <p className="mt-3 text-xs text-ink-400">
                                {hasPatientReviews
                                    ? `Based on ${reviewSummary.totalReviews} patient review${
                                          reviewSummary.totalReviews === 1 ? "" : "s"
                                      }`
                                    : "Platform rating · patient reviews pending"}
                            </p>


                            {reviewSummary?.ratingDistribution && (

                                <div className="mt-6 space-y-2 text-left">

                                    {[5, 4, 3, 2, 1].map(star => {

                                        const count =
                                            reviewSummary.ratingDistribution[star] || 0;

                                        const total =
                                            reviewSummary.totalReviews || 0;

                                        const percentage =
                                            total > 0
                                                ? (count / total) * 100
                                                : 0;

                                        return (

                                            <div
                                                key={star}
                                                className="flex items-center gap-2 text-xs text-ink-500"
                                            >
                                                <span className="w-8 shrink-0">
                                                    {star} ★
                                                </span>

                                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                                                    <div
                                                        className="h-full rounded-full bg-amber-400"
                                                        style={{
                                                            width: `${percentage}%`
                                                        }}
                                                    />
                                                </div>

                                                <span className="w-5 shrink-0 text-right">
                                                    {count}
                                                </span>
                                            </div>

                                        );
                                    })}

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            REVIEWS LIST + FORM
                        ================================================= */}

                        <div className="space-y-5">


                            {/* WRITE A REVIEW */}

                            <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">

                                <h3 className="font-bold text-ink-900">
                                    Write a review
                                </h3>

                                <form
                                    onSubmit={handleReviewSubmit}
                                    className="mt-4"
                                >

                                    <div className="flex items-center gap-1">

                                        {[1, 2, 3, 4, 5].map(star => (

                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() =>
                                                    setReviewForm(previous => ({
                                                        ...previous,
                                                        rating: star
                                                    }))
                                                }
                                                className={`text-2xl transition ${
                                                    star <= reviewForm.rating
                                                        ? "text-amber-500"
                                                        : "text-ink-200"
                                                }`}
                                            >
                                                ★
                                            </button>

                                        ))}

                                    </div>

                                    <textarea
                                        value={reviewForm.comment}
                                        onChange={(event) =>
                                            setReviewForm(previous => ({
                                                ...previous,
                                                comment: event.target.value
                                            }))
                                        }
                                        placeholder="Share your experience with this hospital..."
                                        rows={3}
                                        className="mt-3 w-full rounded-xl border border-ink-200 px-4 py-3 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                                    />

                                    {reviewError && (

                                        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                                            {reviewError}
                                        </div>

                                    )}

                                    {reviewSuccess && (

                                        <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
                                            {reviewSuccess}
                                        </div>

                                    )}

                                    <button
                                        type="submit"
                                        disabled={reviewSubmitting}
                                        className="mt-4 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {reviewSubmitting
                                            ? "Posting..."
                                            : "Post review"}
                                    </button>

                                </form>

                            </div>


                            {/* REVIEWS LIST */}

                            {reviewsLoading ? (

                                <div className="rounded-2xl border border-ink-200 bg-white p-8 text-center">

                                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />

                                </div>

                            ) : reviews.length === 0 ? (

                                <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-8 text-center">

                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg">
                                        💬
                                    </div>

                                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-ink-500">
                                        No patient reviews yet. Be the first
                                        to share your experience and help
                                        others compare.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-4">

                                    {reviews.map(review => (

                                        <ReviewCard
                                            key={review.id}
                                            review={review}
                                        />

                                    ))}

                                </div>

                            )}

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    CONTACT + LOCATION
                ===================================================== */}

                <section className="mt-10 grid gap-5 md:grid-cols-2">

                    <div className="rounded-2xl border border-ink-200 bg-white p-7 shadow-sm">

                        <span className="text-sm font-bold text-brand-600">
                            Contact
                        </span>

                        <h2 className="mt-2 text-xl font-bold">
                            Get in touch
                        </h2>

                        <div className="mt-6 space-y-5">

                            <ContactItem
                                icon="📞"
                                label="Phone"
                                value={
                                    hospital.phoneNumber ||
                                    "Not available"
                                }
                            />

                            <ContactItem
                                icon="📍"
                                label="Address"
                                value={
                                    hospital.address ||
                                    "Not available"
                                }
                            />

                            <ContactItem
                                icon="🏙️"
                                label="City"
                                value={
                                    hospital.city ||
                                    "Not available"
                                }
                            />

                        </div>

                    </div>


                    <div className="rounded-2xl border border-ink-200 bg-white p-7 shadow-sm">

                        <span className="text-sm font-bold text-brand-600">
                            Location
                        </span>

                        <h2 className="mt-2 text-xl font-bold">
                            Hospital location
                        </h2>

                        <div className="mt-6 rounded-xl bg-ink-50 p-5">

                            <div className="text-3xl">
                                📍
                            </div>

                            <p className="mt-3 text-sm leading-6 text-ink-600">
                                {hospital.location ||
                                    hospital.address ||
                                    hospital.city ||
                                    "Location information unavailable."}
                            </p>

                            <button
                                type="button"
                                onClick={handleMap}
                                className="mt-5 inline-flex rounded-xl bg-ink-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-ink-800"
                            >
                                🧭 View Route & Directions →
                            </button>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}


/* =====================================================
   QUICK INFO
===================================================== */

function QuickInfo({
    icon,
    label,
    value
}) {

    return (

        <div className="rounded-xl bg-ink-50 p-4">

            <div className="flex items-start gap-3">

                <span className="text-lg">
                    {icon}
                </span>

                <div className="min-w-0">

                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                        {label}
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-ink-800">
                        {value}
                    </p>

                </div>

            </div>

        </div>
    );
}


/* =====================================================
   SERVICE CARD
===================================================== */

function ServiceCard({
    service,
    onBook
}) {

    const price =
        service.price != null
            ? `₹${Number(
                  service.price
              ).toLocaleString("en-IN")}`
            : "Price unavailable";


    const duration =
        service.durationMinutes != null
            ? `${service.durationMinutes} min`
            : "Duration unavailable";


    const available =
        service.available !== false;


    return (

        <div className="flex flex-col rounded-2xl border border-ink-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-xl">
                    🩺
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                        available
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                    }`}
                >
                    {available
                        ? "Available"
                        : "Unavailable"}
                </span>

            </div>


            <h3 className="mt-5 text-lg font-bold text-ink-900">
                {service.name}
            </h3>


            {service.description && (

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-500">
                    {service.description}
                </p>

            )}


            <div className="mt-5 grid grid-cols-2 gap-3">

                <div className="rounded-xl bg-ink-50 p-3">

                    <p className="text-xs text-ink-400">
                        Price
                    </p>

                    <p className="mt-1 font-bold text-ink-900">
                        {price}
                    </p>

                </div>


                <div className="rounded-xl bg-ink-50 p-3">

                    <p className="text-xs text-ink-400">
                        Duration
                    </p>

                    <p className="mt-1 font-bold text-ink-900">
                        {duration}
                    </p>

                </div>

            </div>


            <button
                type="button"
                onClick={onBook}
                disabled={!available}
                className="mt-5 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
                {available
                    ? "Book this service"
                    : "Unavailable"}
            </button>

        </div>
    );
}


/* =====================================================
   REVIEW CARD
===================================================== */

function ReviewCard({
    review
}) {

    const initials =
        (review.userName || "U")
            .trim()
            .charAt(0)
            .toUpperCase();

    const date =
        review.createdAt
            ? new Date(review.createdAt).toLocaleDateString(
                  "en-IN",
                  { day: "numeric", month: "short", year: "numeric" }
              )
            : "";

    return (

        <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between gap-4">

                <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                        {initials}
                    </div>

                    <div>

                        <p className="text-sm font-bold text-ink-900">
                            {review.userName || "Anonymous"}
                        </p>

                        <div className="mt-0.5 text-sm text-amber-500">
                            {"★".repeat(review.rating || 0)}
                            {"☆".repeat(5 - (review.rating || 0))}
                        </div>

                    </div>

                </div>

                {date && (

                    <span className="shrink-0 text-xs text-ink-400">
                        {date}
                    </span>

                )}

            </div>

            <p className="mt-4 text-sm leading-6 text-ink-600">
                {review.comment}
            </p>

        </div>
    );
}


/* =====================================================
   CONTACT ITEM
===================================================== */

function ContactItem({
    icon,
    label,
    value
}) {

    return (

        <div className="flex gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-50">
                {icon}
            </div>

            <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    {label}
                </p>

                <p className="mt-1 text-sm font-semibold text-ink-800">
                    {value}
                </p>

            </div>

        </div>
    );
}


/* =====================================================
   LOADING SKELETON
===================================================== */

function HospitalDetailsSkeleton() {

    return (

        <div className="min-h-screen bg-[#faf9f7]">

            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-10">

                <div className="h-5 w-40 animate-pulse rounded bg-ink-100" />


                <div className="mt-6 overflow-hidden rounded-3xl border border-ink-200 bg-white">

                    <div className="grid lg:grid-cols-2">

                        <div className="h-[520px] animate-pulse bg-ink-100" />


                        <div className="space-y-5 p-10">

                            <div className="h-10 w-32 animate-pulse rounded-xl bg-ink-100" />

                            <div className="h-12 w-3/4 animate-pulse rounded bg-ink-100" />

                            <div className="h-20 animate-pulse rounded bg-ink-100" />


                            <div className="grid grid-cols-2 gap-4">

                                <div className="h-20 animate-pulse rounded-xl bg-ink-100" />

                                <div className="h-20 animate-pulse rounded-xl bg-ink-100" />

                                <div className="h-20 animate-pulse rounded-xl bg-ink-100" />

                                <div className="h-20 animate-pulse rounded-xl bg-ink-100" />

                            </div>


                            <div className="h-12 animate-pulse rounded-xl bg-ink-100" />

                            <div className="h-12 animate-pulse rounded-xl bg-ink-100" />

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}


export default HospitalDetails;