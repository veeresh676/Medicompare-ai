package com.medicompare.booking.entity;

import com.medicompare.entity.Hospital;
import com.medicompare.serviceentity.HospitalService;
import com.medicompare.user.entity.User;

import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(
        name = "bookings",
        indexes = {
                @Index(
                        name = "idx_booking_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_booking_hospital",
                        columnList = "hospital_id"
                ),
                @Index(
                        name = "idx_booking_service",
                        columnList = "service_id"
                ),
                @Index(
                        name = "idx_booking_date",
                        columnList = "appointment_date"
                ),
                @Index(
                        name = "idx_booking_status",
                        columnList = "status"
                )
        }
)
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "hospital_id",
            nullable = false
    )
    private Hospital hospital;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "service_id",
            nullable = false
    )
    private HospitalService service;


    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(
            message = "Appointment date cannot be in the past"
    )
    @Column(
            name = "appointment_date",
            nullable = false
    )
    private LocalDate appointmentDate;


    @NotNull(message = "Appointment time is required")
    @Column(
            name = "appointment_time",
            nullable = false
    )
    private LocalTime appointmentTime;


    /*
     * Booking workflow:
     *
     * PENDING
     *     ↓
     * ADMIN APPROVES
     *     ↓
     * APPROVED
     *
     * OR
     *
     * PENDING
     *     ↓
     * ADMIN REJECTS
     *     ↓
     * REJECTED
     *
     * Additional lifecycle states:
     *
     * APPROVED → COMPLETED
     * APPROVED → CANCELLED
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private BookingStatus status = BookingStatus.PENDING;


    @Column(
            length = 1000
    )
    private String notes;


    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;


    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (status == null) {
            status = BookingStatus.PENDING;
        }
    }


    public Booking() {
    }


    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public User getUser() {
        return user;
    }


    public void setUser(User user) {
        this.user = user;
    }


    public Hospital getHospital() {
        return hospital;
    }


    public void setHospital(Hospital hospital) {
        this.hospital = hospital;
    }


    public HospitalService getService() {
        return service;
    }


    public void setService(HospitalService service) {
        this.service = service;
    }


    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }


    public void setAppointmentDate(
            LocalDate appointmentDate
    ) {
        this.appointmentDate = appointmentDate;
    }


    public LocalTime getAppointmentTime() {
        return appointmentTime;
    }


    public void setAppointmentTime(
            LocalTime appointmentTime
    ) {
        this.appointmentTime = appointmentTime;
    }


    public BookingStatus getStatus() {
        return status;
    }


    public void setStatus(
            BookingStatus status
    ) {
        this.status = status;
    }


    public String getNotes() {
        return notes;
    }


    public void setNotes(String notes) {
        this.notes = notes;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }


    public enum BookingStatus {

        PENDING,

        APPROVED,

        REJECTED,

        CANCELLED,

        COMPLETED
    }
}