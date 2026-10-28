package com.medicompare.booking.repository;

import com.medicompare.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    List<Booking>
    findByUserIdOrderByAppointmentDateDescAppointmentTimeDesc(
            Long userId
    );


    List<Booking>
    findByUserIdAndStatusOrderByAppointmentDateAscAppointmentTimeAsc(
            Long userId,
            Booking.BookingStatus status
    );


    List<Booking>
    findByHospitalIdOrderByAppointmentDateAscAppointmentTimeAsc(
            Long hospitalId
    );


    List<Booking>
    findByServiceIdAndAppointmentDateOrderByAppointmentTimeAsc(
            Long serviceId,
            LocalDate appointmentDate
    );


    /*
     * Checks whether a service appointment slot is already occupied.
     *
     * Used when a user initially creates a booking.
     */
    boolean
    existsByServiceIdAndAppointmentDateAndAppointmentTime(
            Long serviceId,
            LocalDate appointmentDate,
            LocalTime appointmentTime
    );


    /*
     * Checks whether another booking already occupies
     * the same service/date/time slot.
     *
     * The current booking ID is excluded.
     *
     * This is especially important when an administrator
     * approves a pending booking.
     */
    boolean
    existsByServiceIdAndAppointmentDateAndAppointmentTimeAndIdNot(
            Long serviceId,
            LocalDate appointmentDate,
            LocalTime appointmentTime,
            Long bookingId
    );
}