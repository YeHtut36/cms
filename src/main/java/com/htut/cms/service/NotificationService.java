package com.htut.cms.service;

import com.htut.cms.dto.request.CreateNotificationRequest;
import com.htut.cms.dto.response.NotificationResponse;
import com.htut.cms.model.CourseClass;
import com.htut.cms.model.Enrollment;
import com.htut.cms.model.EnrollmentStatus;
import com.htut.cms.model.Notification;
import com.htut.cms.model.NotificationType;
import com.htut.cms.model.Role;
import com.htut.cms.model.User;
import com.htut.cms.repository.ClassRepository;
import com.htut.cms.repository.EnrollmentRepository;
import com.htut.cms.repository.NotificationRepository;
import com.htut.cms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public int sendNotification(CreateNotificationRequest request) {
        NotificationType type = request.type() == null ? NotificationType.GENERAL : request.type();
        CourseClass courseClass = resolveCourseClass(request);
        Set<User> recipients = resolveRecipients(request, courseClass);

        if (recipients.isEmpty()) {
            throw new IllegalArgumentException("No target students found for this notification.");
        }

        List<Notification> notifications = recipients.stream()
                .map(user -> Notification.builder()
                        .user(user)
                        .courseClass(courseClass)
                        .title(request.title().trim())
                        .message(request.message().trim())
                        .type(type)
                        .isRead(false)
                        .build())
                .toList();

        List<Notification> savedNotifications = notificationRepository.saveAll(notifications);
        savedNotifications.forEach(notification -> messagingTemplate.convertAndSendToUser(
                notification.getUser().getEmail(),
                "/queue/notifications",
                toResponse(notification)
        ));

        return savedNotifications.size();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String studentEmail) {
        User user = userRepository.findByEmailIgnoreCase(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        return notificationRepository.findAllByUser_IdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public NotificationResponse markAsRead(UUID notificationId, String studentEmail) {
        User user = userRepository.findByEmailIgnoreCase(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        Notification notification = notificationRepository.findByIdAndUser_Id(notificationId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Notification not found."));

        notification.setIsRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    private Set<User> resolveRecipients(CreateNotificationRequest request, CourseClass courseClass) {
        if (request.target() == CreateNotificationRequest.NotificationTarget.ALL_STUDENTS) {
            return new LinkedHashSet<>(userRepository.findAllByRoleAndIsActiveTrue(Role.STUDENT));
        }

        if (request.target() == CreateNotificationRequest.NotificationTarget.CLASS_STUDENTS) {
            List<Enrollment> enrollments = enrollmentRepository.findAllByCourseClass_IdAndStatus(
                    courseClass.getId(),
                    EnrollmentStatus.CONFIRMED
            );
            return enrollments.stream()
                    .map(Enrollment::getUser)
                    .filter(user -> Boolean.TRUE.equals(user.getIsActive()))
                    .collect(LinkedHashSet::new, Set::add, Set::addAll);
        }

        throw new IllegalArgumentException("Unsupported notification target.");
    }

    private CourseClass resolveCourseClass(CreateNotificationRequest request) {
        if (request.target() != CreateNotificationRequest.NotificationTarget.CLASS_STUDENTS) {
            return null;
        }

        if (request.classId() == null) {
            throw new IllegalArgumentException("classId is required for CLASS_STUDENTS target.");
        }

        return classRepository.findById(request.classId())
                .orElseThrow(() -> new IllegalArgumentException("Class not found."));
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getIsRead(),
                notification.getCourseClass() == null ? null : notification.getCourseClass().getId(),
                notification.getCourseClass() == null ? null : notification.getCourseClass().getTitle(),
                notification.getCreatedAt()
        );
    }
}

