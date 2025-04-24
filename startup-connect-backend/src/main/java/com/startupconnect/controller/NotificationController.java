package com.startupconnect.controller;

import com.startupconnect.model.Notification;
import com.startupconnect.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam Long userId) {
        List<Notification> notifications = notificationService.getNotificationsForUser(userId);
        return ResponseEntity.ok(notifications);
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification saved = notificationService.createNotification(notification);
        return ResponseEntity.ok(saved);
    }

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(NotificationController.class);

    @PutMapping("/mark-as-read")
    public ResponseEntity<?> markNotificationsAsRead(@RequestBody List<Long> notificationIds) {
        logger.info("Received request to mark notifications as read: {}", notificationIds);
        notificationService.markNotificationsAsRead(notificationIds);
        logger.info("Finished processing mark-as-read for: {}", notificationIds);
        return ResponseEntity.ok().build();
    }
}
