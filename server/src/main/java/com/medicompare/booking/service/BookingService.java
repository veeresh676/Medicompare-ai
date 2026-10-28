package com.medicompare.booking.service;

import com.medicompare.booking.dto.AvailableSlotResponse;
import com.medicompare.booking.dto.BookingRequest;
import com.medicompare.booking.dto.BookingResponse;
import com.medicompare.booking.entity.Booking;
import com.medicompare.booking.repository.BookingRepository;
import com.medicompare.entity.Hospital;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.serviceentity.HospitalService;
import com.medicompare.serviceentity.HospitalServiceRepository;
import com.medicompare.user.entity.User;
import com.medicompare.user.repository.UserRepository;
import com.medicompare.notification.service.NotificationService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final HospitalServiceRepository hospitalServiceRepository;
    private final NotificationService notificationService;

    /*
     * Standard appointment slots.
     *
     * Morning:
     * 09:00 - 12:30
     *
     * Afternoon:
     * 14:00 - 17:00
     *
     * Slots are 30 minutes apart.
     */
    private static final List<LocalTime> APPOINTMENT_SLOTS =
            List.of(
                    LocalTime.of(9, 0),
                    LocalTime.of(9, 30),
                    LocalTime.of(10, 0),
                    LocalTime.of(10, 30),
                    LocalTime.of(11, 0),
                    LocalTime.of(11, 30),
                    LocalTime.of(12, 0),
                    LocalTime.of(12, 30),

                    LocalTime.of(14, 0),
                    LocalTime.of(14, 30),
                    LocalTime.of(15, 0),
                    LocalTime.of(15, 30),
                    LocalTime.of(16, 0),
                    LocalTime.of(16, 30),
                    LocalTime.of(17, 0)
            );


    public BookingService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            HospitalRepository hospitalRepository,
            HospitalServiceRepository hospitalServiceRepository,
            NotificationService notificationService
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.hospitalRepository = hospitalRepository;
        this.hospitalServiceRepository = hospitalServiceRepository;
        this.notificationService = notificationService;
    }


    // =========================================================
    // CREATE BOOKING
    // =========================================================

    @Transactional
    public BookingResponse createBooking(
            Long userId,
            BookingRequest request
    ) {

        if (request.getAppointmentDate() == null) {

            throw new IllegalArgumentException(
                    "Appointment date is required"
            );
        }


        if (request.getAppointmentTime() == null) {

            throw new IllegalArgumentException(
                    "Appointment time is required"
            );
        }


        LocalDate appointmentDate =
                request.getAppointmentDate();

        LocalTime appointmentTime =
                request.getAppointmentTime();


        if (appointmentDate.isBefore(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "Appointment date cannot be in the past"
            );
        }


        if (appointmentDate.equals(LocalDate.now())
                && appointmentTime.isBefore(
                        LocalTime.now()
                )) {

            throw new IllegalArgumentException(
                    "Appointment time must be in the future"
            );
        }


        if (!APPOINTMENT_SLOTS.contains(
                appointmentTime
        )) {

            throw new IllegalArgumentException(
                    "Please select a valid appointment time slot"
            );
        }


        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "User not found"
                                )
                        );


        Hospital hospital =
                hospitalRepository.findById(
                        request.getHospitalId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Hospital not found"
                        )
                );


        HospitalService service =
                hospitalServiceRepository.findById(
                        request.getServiceId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Hospital service not found"
                        )
                );


        if (service.getHospital() == null
                || service.getHospital().getId() == null
                || !service.getHospital()
                        .getId()
                        .equals(hospital.getId())) {

            throw new IllegalArgumentException(
                    "Selected service does not belong to the selected hospital"
            );
        }


        if (!Boolean.TRUE.equals(
                service.getAvailable()
        )) {

            throw new IllegalArgumentException(
                    "This service is currently unavailable"
            );
        }


        List<Booking> bookingsForSlot =
                bookingRepository
                        .findByServiceIdAndAppointmentDateOrderByAppointmentTimeAsc(
                                service.getId(),
                                appointmentDate
                        );


        boolean slotOccupied =
                bookingsForSlot
                        .stream()
                        .anyMatch(booking ->
                                booking.getAppointmentTime()
                                        .equals(appointmentTime)
                                        &&
                                isActiveBooking(
                                        booking
                                )
                        );


        if (slotOccupied) {

            throw new IllegalArgumentException(
                    "This appointment slot is already booked"
            );
        }


        Booking booking =
                new Booking();


        booking.setUser(user);

        booking.setHospital(hospital);

        booking.setService(service);

        booking.setAppointmentDate(
                appointmentDate
        );

        booking.setAppointmentTime(
                appointmentTime
        );

        booking.setNotes(
                request.getNotes()
        );


        booking.setStatus(
                Booking.BookingStatus.PENDING
        );


        Booking savedBooking =
                bookingRepository.save(booking);


        /*
         * No notification on submission by design: users only get
         * notified about the hospital's response (approval or
         * rejection). A "waiting for approval" alert for every
         * booking just creates noise.
         */

        return toResponse(savedBooking);
    }


    // =========================================================
    // GET AVAILABLE TIME SLOTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<AvailableSlotResponse> getAvailableSlots(
            Long serviceId,
            LocalDate appointmentDate
    ) {

        if (serviceId == null) {

            throw new IllegalArgumentException(
                    "Service ID is required"
            );
        }


        if (appointmentDate == null) {

            throw new IllegalArgumentException(
                    "Appointment date is required"
            );
        }


        if (appointmentDate.isBefore(
                LocalDate.now()
        )) {

            throw new IllegalArgumentException(
                    "Appointment date cannot be in the past"
            );
        }


        HospitalService service =
                hospitalServiceRepository.findById(
                        serviceId
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Hospital service not found"
                        )
                );


        if (!Boolean.TRUE.equals(
                service.getAvailable()
        )) {

            throw new IllegalArgumentException(
                    "This service is currently unavailable"
            );
        }


        List<Booking> bookings =
                bookingRepository
                        .findByServiceIdAndAppointmentDateOrderByAppointmentTimeAsc(
                                serviceId,
                                appointmentDate
                        );


        Set<LocalTime> occupiedTimes =
                bookings
                        .stream()
                        .filter(this::isActiveBooking)
                        .map(Booking::getAppointmentTime)
                        .collect(Collectors.toSet());


        return APPOINTMENT_SLOTS
                .stream()
                .map(time ->
                        new AvailableSlotResponse(
                                time.toString(),
                                !occupiedTimes.contains(time)
                        )
                )
                .toList();
    }


    // =========================================================
    // GET USER BOOKINGS
    // =========================================================

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(
            Long userId
    ) {

        return bookingRepository
                .findByUserIdOrderByAppointmentDateDescAppointmentTimeDesc(
                        userId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =========================================================
    // GET UPCOMING APPROVED BOOKINGS
    // =========================================================

    @Transactional(readOnly = true)
    public List<BookingResponse> getUpcomingBookings(
            Long userId
    ) {

        return bookingRepository
                .findByUserIdAndStatusOrderByAppointmentDateAscAppointmentTimeAsc(
                        userId,
                        Booking.BookingStatus.APPROVED
                )
                .stream()
                .filter(booking ->
                        !booking.getAppointmentDate()
                                .isBefore(
                                        LocalDate.now()
                                )
                )
                .map(this::toResponse)
                .toList();
    }


    // =========================================================
    // GET ALL BOOKINGS - ADMIN
    // =========================================================

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {

        return bookingRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =========================================================
    // GET PENDING BOOKINGS - ADMIN
    // =========================================================

    @Transactional(readOnly = true)
    public List<BookingResponse> getPendingBookings() {

        return bookingRepository
                .findAll()
                .stream()
                .filter(booking ->
                        booking.getStatus()
                                == Booking.BookingStatus.PENDING
                )
                .map(this::toResponse)
                .toList();
    }


    // =========================================================
    // CANCEL BOOKING
    // =========================================================

    @Transactional
    public BookingResponse cancelBooking(
            Long bookingId,
            Long userId
    ) {

        Booking booking =
                bookingRepository.findById(
                        bookingId
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Booking not found"
                        )
                );


        if (!booking.getUser()
                .getId()
                .equals(userId)) {

            throw new IllegalArgumentException(
                    "You are not allowed to cancel this booking"
            );
        }


        if (booking.getStatus()
                == Booking.BookingStatus.CANCELLED) {

            throw new IllegalArgumentException(
                    "Booking is already cancelled"
            );
        }


        if (booking.getStatus()
                == Booking.BookingStatus.COMPLETED) {

            throw new IllegalArgumentException(
                    "Completed bookings cannot be cancelled"
            );
        }


        if (booking.getStatus()
                == Booking.BookingStatus.REJECTED) {

            throw new IllegalArgumentException(
                    "Rejected bookings cannot be cancelled"
            );
        }


        booking.setStatus(
                Booking.BookingStatus.CANCELLED
        );


        Booking updatedBooking =
                bookingRepository.save(booking);


        /*
         * No notification on user cancellation by design: only
         * hospital responses (approval / rejection) notify.
         */

        return toResponse(updatedBooking);
    }


    // =========================================================
    // ADMIN APPROVE BOOKING
    // =========================================================

    @Transactional
    public BookingResponse approveBooking(
            Long bookingId
    ) {

        Booking booking =
                bookingRepository.findById(
                        bookingId
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Booking not found"
                        )
                );


        if (booking.getStatus()
                != Booking.BookingStatus.PENDING) {

            throw new IllegalArgumentException(
                    "Only pending bookings can be approved"
            );
        }


        List<Booking> bookingsForSlot =
                bookingRepository
                        .findByServiceIdAndAppointmentDateOrderByAppointmentTimeAsc(
                                booking.getService().getId(),
                                booking.getAppointmentDate()
                        );


        boolean conflictingBooking =
                bookingsForSlot
                        .stream()
                        .anyMatch(other ->
                                !other.getId()
                                        .equals(
                                                booking.getId()
                                        )
                                        &&
                                other.getAppointmentTime()
                                        .equals(
                                                booking.getAppointmentTime()
                                        )
                                        &&
                                isActiveBooking(other)
                        );


        if (conflictingBooking) {

            throw new IllegalArgumentException(
                    "This appointment slot is no longer available"
            );
        }


        booking.setStatus(
                Booking.BookingStatus.APPROVED
        );


        Booking updatedBooking =
                bookingRepository.save(booking);


        /*
         * Notify the user that the hospital approved
         * the appointment.
         */
        notificationService
                .createBookingApprovedNotification(
                        updatedBooking
                );


        return toResponse(updatedBooking);
    }


    // =========================================================
    // ADMIN REJECT BOOKING
    // =========================================================

    @Transactional
    public BookingResponse rejectBooking(
            Long bookingId
    ) {

        Booking booking =
                bookingRepository.findById(
                        bookingId
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Booking not found"
                        )
                );


        if (booking.getStatus()
                != Booking.BookingStatus.PENDING) {

            throw new IllegalArgumentException(
                    "Only pending bookings can be rejected"
            );
        }


        booking.setStatus(
                Booking.BookingStatus.REJECTED
        );


        Booking updatedBooking =
                bookingRepository.save(booking);


        /*
         * Notify the user that the hospital rejected
         * the appointment.
         */
        notificationService
                .createBookingRejectedNotification(
                        updatedBooking
                );


        return toResponse(updatedBooking);
    }


    // =========================================================
    // ADMIN MARK BOOKING COMPLETED
    // =========================================================

    @Transactional
    public BookingResponse completeBooking(
            Long bookingId
    ) {

        Booking booking =
                bookingRepository.findById(
                        bookingId
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Booking not found"
                        )
                );


        if (booking.getStatus()
                != Booking.BookingStatus.APPROVED) {

            throw new IllegalArgumentException(
                    "Only approved bookings can be completed"
            );
        }


        booking.setStatus(
                Booking.BookingStatus.COMPLETED
        );


        bookingRepository.save(booking);

        /*
         * No notification on completion by design: users only get
         * notified about approval or rejection.
         */

        return toResponse(booking);
    }


    // =========================================================
    // GET SINGLE BOOKING
    // =========================================================

    @Transactional(readOnly = true)
    public BookingResponse getBooking(
            Long bookingId,
            Long userId
    ) {

        Booking booking =
                bookingRepository.findById(
                        bookingId
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Booking not found"
                        )
                );


        if (!booking.getUser()
                .getId()
                .equals(userId)) {

            throw new IllegalArgumentException(
                    "You are not allowed to view this booking"
            );
        }


        return toResponse(booking);
    }


    // =========================================================
    // CHECK ACTIVE BOOKING
    // =========================================================

    private boolean isActiveBooking(
            Booking booking
    ) {

        return booking.getStatus()
                == Booking.BookingStatus.PENDING

                ||

                booking.getStatus()
                == Booking.BookingStatus.APPROVED;
    }


    // =========================================================
    // ENTITY → RESPONSE
    // =========================================================

    private BookingResponse toResponse(
            Booking booking
    ) {

        BookingResponse response =
                new BookingResponse();


        if (booking.getUser() != null) {

            response.setUserId(
                    booking.getUser().getId()
            );

            response.setUserName(
                    booking.getUser().getName()
            );

            response.setUserEmail(
                    booking.getUser().getEmail()
            );
        }


        if (booking.getHospital() != null) {

            response.setHospitalId(
                    booking.getHospital().getId()
            );

            response.setHospitalName(
                    booking.getHospital().getName()
            );
        }


        if (booking.getService() != null) {

            response.setServiceId(
                    booking.getService().getId()
            );

            response.setServiceName(
                    booking.getService().getName()
            );

            response.setServicePrice(
                    booking.getService().getPrice()
            );
        }


        response.setId(
                booking.getId()
        );


        response.setAppointmentDate(
                booking.getAppointmentDate()
        );


        response.setAppointmentTime(
                booking.getAppointmentTime()
        );


        response.setStatus(
                booking.getStatus()
        );


        response.setNotes(
                booking.getNotes()
        );


        response.setCreatedAt(
                booking.getCreatedAt()
        );


        return response;
    }
}