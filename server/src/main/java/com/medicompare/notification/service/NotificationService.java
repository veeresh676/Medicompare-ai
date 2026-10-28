package com.medicompare.notification.service;

import com.medicompare.booking.entity.Booking;
import com.medicompare.notification.entity.Notification;
import com.medicompare.notification.repository.NotificationRepository;
import com.medicompare.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository
    ) {
        this.notificationRepository = notificationRepository;
    }

    /*
     * ============================================================
     * CREATE BOOKING NOTIFICATION
     * ============================================================
     */

    public Notification createBookingCreatedNotification(
            Booking booking
    ) {
        String message =
                "Your appointment request has been submitted and is waiting for hospital approval.";

        return createNotification(
                booking.getUser(),
                message,
                Notification.NotificationType.BOOKING_CREATED,
                booking.getId()
        );
    }


    /*
     * ============================================================
     * BOOKING APPROVED
     * ============================================================
     */

    public Notification createBookingApprovedNotification(
            Booking booking
    ) {
        String hospitalName =
                booking.getHospital() != null
                        ? booking.getHospital().getName()
                        : "the hospital";

        String serviceName =
                booking.getService() != null
                        ? booking.getService().getName()
                        : "your selected service";

        String message =
                "Your appointment at "
                        + hospitalName
                        + " for "
                        + serviceName
                        + " has been approved.";

        return createNotification(
                booking.getUser(),
                message,
                Notification.NotificationType.BOOKING_APPROVED,
                booking.getId()
        );
    }


    /*
     * ============================================================
     * BOOKING REJECTED
     * ============================================================
     */

    public Notification createBookingRejectedNotification(
            Booking booking
    ) {
        String hospitalName =
                booking.getHospital() != null
                        ? booking.getHospital().getName()
                        : "the hospital";

        String message =
                "Your appointment request at "
                        + hospitalName
                        + " has been rejected by the hospital.";

        return createNotification(
                booking.getUser(),
                message,
                Notification.NotificationType.BOOKING_REJECTED,
                booking.getId()
        );
    }


    /*
     * ============================================================
     * BOOKING CANCELLED
     * ============================================================
     */

    public Notification createBookingCancelledNotification(
            Booking booking
    ) {
        String message =
                "Your appointment request has been cancelled.";

        return createNotification(
                booking.getUser(),
                message,
                Notification.NotificationType.BOOKING_CANCELLED,
                booking.getId()
        );
    }


    /*
     * ============================================================
     * BOOKING COMPLETED
     * ============================================================
     */

    public Notification createBookingCompletedNotification(
            Booking booking
    ) {
        String message =
                "Your appointment has been marked as completed.";

        return createNotification(
                booking.getUser(),
                message,
                Notification.NotificationType.BOOKING_COMPLETED,
                booking.getId()
        );
    }


    /*
     * ============================================================
     * GENERIC CREATE
     * ============================================================
     */

    private Notification createNotification(
            User user,
            String message,
            Notification.NotificationType type,
            Long bookingId
    ) {
        Notification notification =
                new Notification(
                        user,
                        message,
                        type,
                        bookingId
                );

        return notificationRepository.save(
                notification
        );
    }


    /*
     * ============================================================
     * GET ALL USER NOTIFICATIONS
     * ============================================================
     */

    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(
            Long userId
    ) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(
                        userId
                );
    }


    /*
     * ============================================================
     * GET UNREAD NOTIFICATIONS
     * ============================================================
     */

    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(
            Long userId
    ) {
        return notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(
                        userId
                );
    }


    /*
     * ============================================================
     * UNREAD COUNT
     * ============================================================
     */

    @Transactional(readOnly = true)
    public long getUnreadCount(
            Long userId
    ) {
        return notificationRepository
                .countByUserIdAndReadFalse(
                        userId
                );
    }


    /*
     * ============================================================
     * MARK ONE AS READ — deletes so it disappears after seen
     * (requirement: once an approval/rejection is viewed it
     * must not linger).
     * ============================================================
     */

    public void markAsRead(
            Long notificationId,
            Long userId
    ) {
        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Notification not found"
                                )
                        );

        if (
                notification.getUser() == null ||
                !notification.getUser()
                        .getId()
                        .equals(userId)
        ) {
            throw new IllegalArgumentException(
                    "You are not allowed to access this notification"
            );
        }

        notificationRepository.delete(notification);
    }


    /*
     * ============================================================
     * MARK ALL AS READ — deletes all (disappear after seen)
     * ============================================================
     */

    public void markAllAsRead(
            Long userId
    ) {
        List<Notification> notifications =
                notificationRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                userId
                        );

        notificationRepository.deleteAll(notifications);
    }
}