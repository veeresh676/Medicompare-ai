package com.medicompare.booking.controller;

import com.medicompare.booking.dto.AvailableSlotResponse;
import com.medicompare.booking.dto.BookingRequest;
import com.medicompare.booking.dto.BookingResponse;
import com.medicompare.booking.service.BookingService;
import com.medicompare.user.entity.User;
import com.medicompare.user.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    public BookingController(
            BookingService bookingService,
            UserRepository userRepository
    ) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        BookingResponse response =
                bookingService.createBooking(user.getId(), request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /*
     * Get available appointment time slots
     *
     * Example:
     * GET /api/bookings/available-slots?serviceId=1&date=2026-09-10
     */
    @GetMapping("/available-slots")
    public ResponseEntity<List<AvailableSlotResponse>> getAvailableSlots(
            @RequestParam Long serviceId,
            @RequestParam LocalDate date
    ) {
        return ResponseEntity.ok(
                bookingService.getAvailableSlots(serviceId, date)
        );
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                bookingService.getUserBookings(user.getId())
        );
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<BookingResponse>> getUpcomingBookings(
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                bookingService.getUpcomingBookings(user.getId())
        );
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> getBooking(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                bookingService.getBooking(
                        bookingId,
                        user.getId()
                )
        );
    }

    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                bookingService.cancelBooking(
                        bookingId,
                        user.getId()
                )
        );
    }

    private User getAuthenticatedUser(
            Authentication authentication
    ) {
        if (authentication == null ||
                authentication.getName() == null ||
                authentication.getName().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in to continue."
            );
        }

        String email = authentication.getName();

        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Please log in with a user account."
                        )
                );
    }
}