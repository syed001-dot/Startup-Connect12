package com.startupconnect.service;

import com.startupconnect.model.Notification;
import com.startupconnect.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(NotificationService.class);

    public List<Notification> getNotificationsForUser(Long userId) {
        List<Notification> notifs = notificationRepository.findByUserIdOrderByDateDesc(userId);
        logger.info("Fetched {} notifications for user {}: {}", notifs.size(), userId, notifs);
        return notifs;
    }

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public void markNotificationsAsRead(List<Long> notificationIds) {
        logger.info("Service: Marking notifications as read: {}", notificationIds);
        List<Notification> notifications = notificationRepository.findAllById(notificationIds);
        for (Notification notif : notifications) {
            logger.info("Before: Notification {} status={}", notif.getId(), notif.getStatus());
            notif.setStatus("read");
            logger.info("After: Notification {} status={}", notif.getId(), notif.getStatus());
        }
        notificationRepository.saveAll(notifications);
        logger.info("Saved all marked-as-read notifications.");
        // Fetch again to confirm
        List<Notification> saved = notificationRepository.findAllById(notificationIds);
        for (Notification notif : saved) {
            logger.info("After SAVE: Notification {} status={}", notif.getId(), notif.getStatus());
        }
    }
}
