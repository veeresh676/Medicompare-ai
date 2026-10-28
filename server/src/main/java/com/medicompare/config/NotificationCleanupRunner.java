package com.medicompare.config;

import com.medicompare.notification.entity.Notification;
import com.medicompare.notification.repository.NotificationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * One-time cleanup after switching to response-only notifications.
 *
 * Removes all historical BOOKING_CREATED / CANCELLED / COMPLETED /
 * GENERAL noise — only approvals and rejections remain. Runs once;
 * afterwards there is nothing to clean.
 */
@Component
@Order(26)
public class NotificationCleanupRunner implements CommandLineRunner {

    private final NotificationRepository notificationRepository;

    public NotificationCleanupRunner(
            NotificationRepository notificationRepository
    ) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {

        List<Notification> all =
                notificationRepository.findAll();

        List<Notification> toDelete = all.stream()
                .filter(notification ->
                        notification.getType() != Notification.NotificationType.BOOKING_APPROVED
                                && notification.getType() != Notification.NotificationType.BOOKING_REJECTED)
                .toList();

        if (!toDelete.isEmpty()) {
            notificationRepository.deleteAll(toDelete);
        }

        System.out.println("Notification cleanup complete. "
                + "Removed non-response notifications: " + toDelete.size()
                + " | remaining (approved/rejected): " + (all.size() - toDelete.size()));
    }
}
