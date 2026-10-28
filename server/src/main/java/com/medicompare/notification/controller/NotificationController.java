package com.medicompare.notification.controller;

import com.medicompare.notification.entity.Notification;
import com.medicompare.notification.service.NotificationService;
import com.medicompare.user.entity.User;
import com.medicompare.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(
            NotificationService notificationService,
            UserRepository userRepository
    ) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }


    // =========================================================
    // GET ALL MY NOTIFICATIONS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                notificationService.getUserNotifications(
                        user.getId()
                )
        );
    }


    // =========================================================
    // GET UNREAD NOTIFICATIONS
    // =========================================================

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(
                        user.getId()
                )
        );
    }


    // =========================================================
    // GET UNREAD COUNT
    // =========================================================

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                notificationService.getUnreadCount(
                        user.getId()
                )
        );
    }


    // =========================================================
    // MARK ONE NOTIFICATION AS READ
    // =========================================================

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        notificationService.markAsRead(
                notificationId,
                user.getId()
        );

        return ResponseEntity.noContent().build();
    }


    // =========================================================
    // MARK ALL NOTIFICATIONS AS READ
    // =========================================================

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        notificationService.markAllAsRead(
                user.getId()
        );

        return ResponseEntity.noContent().build();
    }


    // =========================================================
    // GET AUTHENTICATED USER
    // =========================================================

    private User getAuthenticatedUser(
            Authentication authentication
    ) {
        if (
                authentication == null ||
                authentication.getName() == null ||
                authentication.getName().isBlank()
        ) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in to continue."
            );
        }

        String email =
                authentication.getName();

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