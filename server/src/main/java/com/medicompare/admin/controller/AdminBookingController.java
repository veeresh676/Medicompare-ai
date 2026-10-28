package com.medicompare.admin.controller;

import com.medicompare.booking.dto.BookingResponse;
import com.medicompare.booking.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final BookingService bookingService;

    public AdminBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Get all bookings.
     *
     * GET /api/admin/bookings
     */
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {

        return ResponseEntity.ok(
                bookingService.getAllBookings()
        );
    }

    /**
     * Get pending bookings.
     *
     * GET /api/admin/bookings/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<List<BookingResponse>> getPendingBookings() {

        return ResponseEntity.ok(
                bookingService.getPendingBookings()
        );
    }

    /**
     * Approve a booking.
     *
     * PENDING -> APPROVED
     *
     * PATCH /api/admin/bookings/{bookingId}/approve
     */
    @PatchMapping("/{bookingId}/approve")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable Long bookingId
    ) {

        return ResponseEntity.ok(
                bookingService.approveBooking(bookingId)
        );
    }

    /**
     * Reject a booking.
     *
     * PENDING -> REJECTED
     *
     * PATCH /api/admin/bookings/{bookingId}/reject
     */
    @PatchMapping("/{bookingId}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable Long bookingId
    ) {

        return ResponseEntity.ok(
                bookingService.rejectBooking(bookingId)
        );
    }

    /**
     * Complete an approved booking.
     *
     * APPROVED -> COMPLETED
     *
     * PATCH /api/admin/bookings/{bookingId}/complete
     */
    @PatchMapping("/{bookingId}/complete")
    public ResponseEntity<BookingResponse> completeBooking(
            @PathVariable Long bookingId
    ) {

        return ResponseEntity.ok(
                bookingService.completeBooking(bookingId)
        );
    }
}