package com.htut.cms.controller;

import com.htut.cms.dto.request.CreateNotificationRequest;
import com.htut.cms.dto.response.NotificationResponse;
import com.htut.cms.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> sendNotification(@Valid @RequestBody CreateNotificationRequest request) {
        int recipients = notificationService.sendNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Notification sent successfully.",
                "recipientCount", recipients
        ));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getMyNotifications(authentication.getName()));
    }

    @PatchMapping("/{notificationId}/read")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable UUID notificationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId, authentication.getName()));
    }
}

