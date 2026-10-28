import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import api from "../api/api";

function Booking() {
    const location = useLocation();
    const navigate = useNavigate();

    const passedHospital =
        location.state?.hospital || null;

    const [hospitals, setHospitals] = useState(
        passedHospital ? [passedHospital] : []
    );

    const [services, setServices] = useState([]);

    const [selectedHospitalId, setSelectedHospitalId] =
        useState(
            passedHospital?.id
                ? String(passedHospital.id)
                : ""
        );

    const [selectedServiceId, setSelectedServiceId] =
        useState("");

    const [appointmentDate, setAppointmentDate] =
        useState("");

    const [appointmentTime, setAppointmentTime] =
        useState("");

    const [availableSlots, setAvailableSlots] =
        useState([]);

    const [loadingSlots, setLoadingSlots] =
        useState(false);

    const [notes, setNotes] =
        useState("");

    const [loadingHospitals, setLoadingHospitals] =
        useState(!passedHospital);

    const [loadingServices, setLoadingServices] =
        useState(false);

    const [booking, setBooking] =
        useState(false);

    /*
     * Frozen snapshot of the last successful booking.
     * The summary keeps showing these booked values instead of
     * flipping back to "Not selected" when the form resets.
     */
    const [confirmedBooking, setConfirmedBooking] =
        useState(null);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    const minimumDate = useMemo(() => {
        /*
         * Local calendar date (not UTC): toISOString() can shift
         * the day backwards in IST evenings and wrongly allow
         * — or block — dates at the boundary.
         */
        const today = new Date();

        const year = today.getFullYear();
        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");
        const day = String(
            today.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }, []);


    /*
     * Sequence guard: slot requests that resolve out of order
     * must never overwrite a newer selection. Without this,
     * picking date B while date A's request is still in flight
     * could display A's slots and wipe a valid time pick.
     */
    const slotsRequestRef = useRef(0);


    /*
     * ============================================================
     * LOAD HOSPITALS
     * ============================================================
     */

    useEffect(() => {

        if (passedHospital) {
            return;
        }

        loadHospitals();

    }, [passedHospital]);


    async function loadHospitals() {

        try {

            setLoadingHospitals(true);
            setError("");

            const response =
                await api.get("/hospitals?size=300");

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
                "Unable to load hospitals. Please try again."
            );

        } finally {

            setLoadingHospitals(false);

        }
    }


    /*
     * ============================================================
     * LOAD SERVICES
     * ============================================================
     */

    useEffect(() => {

        if (!selectedHospitalId) {

            setServices([]);
            setSelectedServiceId("");
            setAvailableSlots([]);
            setAppointmentTime("");

            return;
        }

        loadServices(selectedHospitalId);

    }, [selectedHospitalId]);


    async function loadServices(hospitalId) {

        try {

            setLoadingServices(true);
            setError("");

            setSelectedServiceId("");
            setAvailableSlots([]);
            setAppointmentTime("");

            /*
             * IMPORTANT:
             *
             * This is a public hospital endpoint.
             * We do NOT use /api/admin/... here because
             * this page belongs to a normal USER.
             */
            const response =
                await api.get(
                    `/hospitals/${hospitalId}/services`
                );

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.content || [];

            setServices(
                data.filter(
                    service =>
                        service.available !== false
                )
            );

        } catch (err) {

            console.error(
                "Failed to load services:",
                err
            );

            setServices([]);

            setError(
                "Unable to load services for this hospital."
            );

        } finally {

            setLoadingServices(false);

        }
    }


    /*
     * ============================================================
     * LOAD AVAILABLE TIME SLOTS
     * ============================================================
     */

    useEffect(() => {

        if (
            !selectedServiceId ||
            !appointmentDate
        ) {

            setAvailableSlots([]);
            setAppointmentTime("");

            return;
        }

        loadAvailableSlots(
            selectedServiceId,
            appointmentDate
        );

    }, [
        selectedServiceId,
        appointmentDate
    ]);


    async function loadAvailableSlots(
        serviceId,
        date
    ) {

        const requestId = ++slotsRequestRef.current;

        try {

            setLoadingSlots(true);
            setError("");
            setAppointmentTime("");

            const response =
                await api.get(
                    "/bookings/available-slots",
                    {
                        params: {
                            serviceId:
                                Number(serviceId),

                            date
                        }
                    }
                );

            // A newer request has started — discard this stale result.
            if (requestId !== slotsRequestRef.current) {
                return;
            }

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            setAvailableSlots(data);

        } catch (err) {

            // A newer request has started — ignore this stale error too.
            if (requestId !== slotsRequestRef.current) {
                return;
            }

            console.error(
                "Failed to load available slots:",
                err
            );

            setAvailableSlots([]);
            setAppointmentTime("");

            const backendMessage =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to load available appointment slots.";

            setError(
                backendMessage
            );

        } finally {

            if (requestId === slotsRequestRef.current) {
                setLoadingSlots(false);
            }

        }
    }


    /*
     * ============================================================
     * HOSPITAL CHANGE
     * ============================================================
     */

    function handleHospitalChange(event) {

        const hospitalId =
            event.target.value;

        setSelectedHospitalId(
            hospitalId
        );

        setSelectedServiceId("");
        setAppointmentTime("");
        setAvailableSlots([]);

        /*
         * The chosen date is PRESERVED across hospital changes:
         * slots simply reload once a service is picked again.
         * Wiping the date here was the main reason users saw
         * "Not selected" after making a selection.
         */
        setMessage("");
        setError("");
        setConfirmedBooking(null);

    }


    /*
     * ============================================================
     * SERVICE CHANGE
     * ============================================================
     */

    function handleServiceChange(event) {

        const serviceId =
            event.target.value;

        setSelectedServiceId(
            serviceId
        );

        setAppointmentTime("");
        setAvailableSlots([]);

        setMessage("");
        setError("");
        setConfirmedBooking(null);

    }


    /*
     * ============================================================
     * DATE CHANGE
     * ============================================================
     */

    function handleDateChange(event) {

        const date =
            event.target.value;

        setAppointmentDate(
            date
        );

        setAppointmentTime("");

        setMessage("");
        setError("");
        setConfirmedBooking(null);

    }


    /*
     * ============================================================
     * SLOT SELECTION
     * ============================================================
     */

    function handleSlotSelect(slot) {

        if (
            !slot.available ||
            booking
        ) {
            return;
        }

        setAppointmentTime(
            slot.time
        );

        setMessage("");
        setError("");
        setConfirmedBooking(null);

    }


    /*
     * ============================================================
     * SUBMIT BOOKING
     * ============================================================
     */

    async function handleSubmit(event) {

        event.preventDefault();

        setMessage("");
        setError("");


        if (!selectedHospitalId) {

            setError(
                "Please select a hospital."
            );

            return;
        }


        if (!selectedServiceId) {

            setError(
                "Please select a service."
            );

            return;
        }


        if (!appointmentDate) {

            setError(
                "Please select an appointment date."
            );

            return;
        }


        if (!appointmentTime) {

            setError(
                "Please select an available appointment time."
            );

            return;
        }


        try {

            setBooking(true);


            const response =
                await api.post(
                    "/bookings",
                    {
                        hospitalId:
                            Number(
                                selectedHospitalId
                            ),

                        serviceId:
                            Number(
                                selectedServiceId
                            ),

                        appointmentDate,

                        appointmentTime,

                        notes:
                            notes.trim()
                                ? notes.trim()
                                : null
                    }
                );


            const bookingData =
                response.data;


            setMessage(
                `Appointment request submitted! Booking #${bookingData.id} is scheduled for ${formatDate(bookingData.appointmentDate)} at ${formatTime(bookingData.appointmentTime)}. The hospital will review your request.`
            );


            /*
             * Freeze the booked values for the summary BEFORE
             * resetting the form — otherwise the summary flips
             * to "Not selected" right after a successful booking.
             */
            const bookedHospital =
                hospitals.find(
                    hospital =>
                        String(hospital.id) ===
                        String(selectedHospitalId)
                );

            const bookedService =
                services.find(
                    service =>
                        String(service.id) ===
                        String(selectedServiceId)
                );

            setConfirmedBooking({
                id: bookingData.id,
                hospitalName: bookedHospital?.name || "",
                city:
                    bookedHospital?.city ||
                    bookedHospital?.address ||
                    "",
                serviceName: bookedService?.name || "",
                price: bookedService?.price ?? null,
                date: appointmentDate,
                time: appointmentTime,
            });


            setSelectedHospitalId("");
            setSelectedServiceId("");
            setServices([]);
            setAppointmentDate("");
            setAppointmentTime("");
            setAvailableSlots([]);
            setNotes("");

        } catch (err) {

            console.error(
                "Booking failed:",
                err
            );


            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {

                setError(
                    "Your session has expired. Please log in again."
                );

                return;
            }


            const backendMessage =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to create the booking.";


            setError(
                backendMessage
            );

        } finally {

            setBooking(false);

        }
    }


    /*
     * ============================================================
     * SELECTED DATA
     * ============================================================
     */

    const selectedHospital =
        hospitals.find(
            hospital =>
                String(hospital.id) ===
                String(selectedHospitalId)
        );


    const selectedService =
        services.find(
            service =>
                String(service.id) ===
                String(selectedServiceId)
        );


    /*
     * ============================================================
     * PAGE
     * ============================================================
     */

    return (

        <div className="min-h-screen bg-[#faf9f7] text-ink-900">

            <Navbar />


            <main className="mx-auto max-w-6xl px-6 py-8">


                {/* ==================================================
                    BACK
                ================================================== */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(-1)
                    }
                    className="text-sm font-semibold text-brand-600 transition hover:text-brand-700"
                >
                    ← Back
                </button>


                {/* ==================================================
                    HEADER
                ================================================== */}

                <section className="mt-6">

                    <span className="text-sm font-bold text-brand-600">
                        Appointment
                    </span>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                        Book an Appointment
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">
                        Choose your hospital, select a healthcare
                        service, and schedule a convenient appointment.
                    </p>

                </section>


                {/* ==================================================
                    MAIN GRID
                ================================================== */}

                <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_350px]">


                    {/* ==================================================
                        BOOKING FORM
                    ================================================== */}

                    <form
                        onSubmit={handleSubmit}
                        className="rounded-3xl border border-ink-200 bg-white p-6 shadow-sm sm:p-8"
                    >

                        <div className="space-y-6">


                            {/* HOSPITAL */}

                            <div>

                                <label
                                    htmlFor="hospital"
                                    className="mb-2 block text-sm font-bold text-ink-800"
                                >
                                    Hospital
                                </label>

                                <select
                                    id="hospital"
                                    value={selectedHospitalId}
                                    onChange={
                                        handleHospitalChange
                                    }
                                    disabled={
                                        loadingHospitals ||
                                        booking
                                    }
                                    className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-800 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                                >

                                    <option value="">

                                        {loadingHospitals
                                            ? "Loading hospitals..."
                                            : "Select a hospital"}

                                    </option>


                                    {hospitals.map(
                                        hospital => (

                                            <option
                                                key={
                                                    hospital.id
                                                }
                                                value={
                                                    hospital.id
                                                }
                                            >
                                                {hospital.name}

                                                {hospital.city
                                                    ? ` — ${hospital.city}`
                                                    : ""}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* SERVICE */}

                            <div>

                                <label
                                    htmlFor="service"
                                    className="mb-2 block text-sm font-bold text-ink-800"
                                >
                                    Healthcare Service
                                </label>

                                <select
                                    id="service"
                                    value={selectedServiceId}
                                    onChange={
                                        handleServiceChange
                                    }
                                    disabled={
                                        !selectedHospitalId ||
                                        loadingServices ||
                                        booking
                                    }
                                    className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-800 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                                >

                                    <option value="">

                                        {!selectedHospitalId
                                            ? "Select a hospital first"
                                            : loadingServices
                                              ? "Loading services..."
                                              : services.length === 0
                                                ? "No services available"
                                                : "Select a service"}

                                    </option>


                                    {services.map(
                                        service => (

                                            <option
                                                key={
                                                    service.id
                                                }
                                                value={
                                                    service.id
                                                }
                                            >
                                                {service.name}

                                                {service.price != null
                                                    ? ` — ₹${Number(
                                                          service.price
                                                      ).toLocaleString(
                                                          "en-IN"
                                                      )}`
                                                    : ""}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* DATE */}

                            <div>

                                <label
                                    htmlFor="appointmentDate"
                                    className="mb-2 block text-sm font-bold text-ink-800"
                                >
                                    Appointment Date
                                </label>

                                <input
                                    id="appointmentDate"
                                    type="date"
                                    min={minimumDate}
                                    value={
                                        appointmentDate
                                    }
                                    onChange={
                                        handleDateChange
                                    }
                                    disabled={
                                        !selectedServiceId ||
                                        booking
                                    }
                                    className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-800 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                                />

                                {!selectedServiceId && (
                                    <p className="mt-2 text-xs text-ink-400">
                                        Select a healthcare service first.
                                    </p>
                                )}

                            </div>


                            {/* TIME SLOTS */}

                            <div>

                                <div className="mb-3 flex items-center justify-between">

                                    <label className="block text-sm font-bold text-ink-800">
                                        Appointment Time
                                    </label>

                                    {appointmentDate &&
                                        selectedServiceId &&
                                        !loadingSlots && (
                                            <span className="text-xs font-medium text-ink-400">
                                                {availableSlots.filter(
                                                    slot =>
                                                        slot.available
                                                ).length}{" "}
                                                available
                                            </span>
                                        )}

                                </div>


                                {!appointmentDate && (
                                    <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50 px-4 py-5 text-center">

                                        <p className="text-sm font-medium text-ink-500">
                                            Select a date to see available times.
                                        </p>

                                    </div>
                                )}


                                {appointmentDate &&
                                    loadingSlots && (
                                        <div className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-5 text-center">

                                            <p className="text-sm font-medium text-ink-500">
                                                Loading available times...
                                            </p>

                                        </div>
                                    )}


                                {appointmentDate &&
                                    !loadingSlots &&
                                    availableSlots.length === 0 && (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-5 text-center">

                                            <p className="text-sm font-semibold text-amber-800">
                                                No appointment slots are available for this date.
                                            </p>

                                        </div>
                                    )}


                                {appointmentDate &&
                                    !loadingSlots &&
                                    availableSlots.length > 0 && (

                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                                            {availableSlots.map(
                                                slot => {

                                                    const selected =
                                                        appointmentTime ===
                                                        slot.time;

                                                    return (

                                                        <button
                                                            key={
                                                                slot.time
                                                            }
                                                            type="button"
                                                            disabled={
                                                                !slot.available ||
                                                                booking
                                                            }
                                                            onClick={() =>
                                                                handleSlotSelect(
                                                                    slot
                                                                )
                                                            }
                                                            className={`
                                                                rounded-xl border px-3 py-3 text-sm font-bold transition
                                                                ${
                                                                    selected
                                                                        ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                                                                        : slot.available
                                                                          ? "border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400 hover:bg-brand-100"
                                                                          : "cursor-not-allowed border-ink-100 bg-ink-100 text-ink-400 line-through"
                                                                }
                                                            `}
                                                        >

                                                            {formatTime(
                                                                slot.time
                                                            )}

                                                            {!slot.available && (
                                                                <span className="mt-0.5 block text-[10px] font-semibold no-underline">
                                                                    Booked
                                                                </span>
                                                            )}

                                                        </button>

                                                    );
                                                }
                                            )}

                                        </div>

                                    )}


                                {appointmentTime && (
                                    <p className="mt-3 text-xs font-semibold text-brand-600">
                                        Selected time:{" "}
                                        {formatTime(
                                            appointmentTime
                                        )}
                                    </p>
                                )}

                            </div>


                            {/* NOTES */}

                            <div>

                                <div className="flex items-center justify-between">

                                    <label
                                        htmlFor="notes"
                                        className="mb-2 block text-sm font-bold text-ink-800"
                                    >
                                        Additional Notes
                                    </label>

                                    <span className="text-xs text-ink-400">
                                        Optional
                                    </span>

                                </div>


                                <textarea
                                    id="notes"
                                    rows="4"
                                    maxLength="500"
                                    value={notes}
                                    onChange={
                                        event => {
                                            setNotes(
                                                event.target.value
                                            );

                                            setMessage("");
                                            setError("");
                                        }
                                    }
                                    disabled={booking}
                                    placeholder="Tell the hospital anything important about your appointment..."
                                    className="w-full resize-none rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                                />

                                <p className="mt-1 text-right text-xs text-ink-400">
                                    {notes.length}/500
                                </p>

                            </div>


                            {/* ERROR */}

                            {error && (

                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700">

                                    {error}

                                </div>

                            )}


                            {/* SUCCESS */}

                            {message && (

                                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm font-medium text-green-700">

                                    <div className="flex gap-3">

                                        <span className="text-lg">
                                            ✓
                                        </span>

                                        <span>
                                            {message}
                                        </span>

                                    </div>

                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    "/bookings"
                                                )
                                            }
                                            className="flex-1 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-800"
                                        >
                                            View my bookings →
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMessage("");
                                                setError("");
                                                setConfirmedBooking(
                                                    null
                                                );
                                            }}
                                            className="flex-1 rounded-xl border border-green-300 bg-white px-4 py-2.5 text-sm font-bold text-green-800 transition hover:bg-green-100"
                                        >
                                            Book another
                                        </button>

                                    </div>

                                </div>

                            )}


                            {/* SUBMIT */}

                            <button
                                type="submit"
                                disabled={
                                    booking ||
                                    !selectedHospitalId ||
                                    !selectedServiceId ||
                                    !appointmentDate ||
                                    !appointmentTime
                                }
                                className="w-full rounded-xl bg-brand-500 px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {booking
                                    ? "Submitting Appointment..."
                                    : "📅 Request Appointment"}

                            </button>

                        </div>

                    </form>


                    {/* ==================================================
                        SUMMARY
                    ================================================== */}

                    <aside className="h-fit overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-sm">

                        <div className="border-b border-ink-100 bg-ink-50 px-6 py-5">

                            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                                Booking summary
                            </p>

                            <h2 className="mt-1 text-xl font-bold text-ink-900">
                                {confirmedBooking
                                    ? `Booked ✓ #${confirmedBooking.id}`
                                    : "Your appointment"}
                            </h2>

                        </div>


                        <div className="space-y-5 p-6">


                            {/* HOSPITAL */}

                            <SummaryItem
                                label="Hospital"
                                active={Boolean(
                                    confirmedBooking?.hospitalName ||
                                    selectedHospital
                                )}
                                value={
                                    confirmedBooking?.hospitalName ||
                                    selectedHospital?.name ||
                                    "Not selected"
                                }
                            />


                            {/* CITY */}

                            <SummaryItem
                                label="Location"
                                active={Boolean(
                                    confirmedBooking?.city ||
                                    selectedHospital
                                )}
                                value={
                                    confirmedBooking?.city ||
                                    selectedHospital?.city ||
                                    selectedHospital?.address ||
                                    "Not selected"
                                }
                            />


                            {/* SERVICE */}

                            <SummaryItem
                                label="Service"
                                active={Boolean(
                                    confirmedBooking?.serviceName ||
                                    selectedService
                                )}
                                value={
                                    confirmedBooking?.serviceName ||
                                    selectedService?.name ||
                                    "Not selected"
                                }
                            />


                            {/* PRICE */}

                            <SummaryItem
                                label="Service price"
                                active={Boolean(
                                    confirmedBooking?.price != null ||
                                    selectedService?.price != null
                                )}
                                value={
                                    (confirmedBooking?.price ??
                                        selectedService?.price) != null
                                        ? `₹${Number(
                                              confirmedBooking?.price ??
                                                  selectedService.price
                                          ).toLocaleString(
                                              "en-IN"
                                          )}`
                                        : "—"
                                }
                            />


                            {/* DATE */}

                            <SummaryItem
                                label="Date"
                                active={Boolean(
                                    confirmedBooking?.date ||
                                    appointmentDate
                                )}
                                value={
                                    confirmedBooking?.date ||
                                    appointmentDate
                                        ? formatDate(
                                              confirmedBooking?.date ||
                                                  appointmentDate
                                          )
                                        : "Not selected"
                                }
                            />


                            {/* TIME */}

                            <SummaryItem
                                label="Time"
                                active={Boolean(
                                    confirmedBooking?.time ||
                                    appointmentTime
                                )}
                                value={
                                    confirmedBooking?.time ||
                                    appointmentTime
                                        ? formatTime(
                                              confirmedBooking?.time ||
                                                  appointmentTime
                                          )
                                        : "Not selected"
                                }
                            />


                            <div className="rounded-xl bg-brand-50 p-4">

                                <p className="text-xs font-bold text-brand-700">
                                    Before you book
                                </p>

                                <p className="mt-2 text-xs leading-5 text-brand-800/80">
                                    Your request will be sent to the
                                    hospital as PENDING. The hospital
                                    must approve it before the appointment
                                    is confirmed.
                                </p>

                            </div>

                        </div>

                    </aside>

                </div>

            </main>

        </div>
    );
}


/* ============================================================
   SUMMARY ITEM
============================================================ */

function SummaryItem({
    label,
    value,
    active = false
}) {
    return (
        <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                {label}
            </p>

            <p
                className={`mt-1 text-sm font-semibold leading-5 ${
                    active
                        ? "text-green-700"
                        : "text-ink-800"
                }`}
            >
                {active ? "✓ " : ""}
                {value}
            </p>

        </div>
    );
}


/* ============================================================
   FORMAT DATE
============================================================ */

function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


/* ============================================================
   FORMAT TIME
============================================================ */

function formatTime(value) {

    if (!value) {
        return "—";
    }

    const parts =
        value.split(":");

    if (parts.length < 2) {
        return value;
    }

    const hours =
        Number(parts[0]);

    const minutes =
        Number(parts[1]);

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
    ) {
        return value;
    }

    const date =
        new Date();

    date.setHours(
        hours,
        minutes,
        0,
        0
    );

    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


export default Booking;