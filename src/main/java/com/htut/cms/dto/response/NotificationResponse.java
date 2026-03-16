package com.htut.cms.dto.response;

import com.htut.cms.model.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String title,
        String message,
        NotificationType type,
        Boolean isRead,
        UUID classId,
        String classTitle,
        LocalDateTime createdAt
) {
}

