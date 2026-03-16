package com.htut.cms.dto.request;

import com.htut.cms.model.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateNotificationRequest(
        @NotBlank @Size(max = 255) String title,
        @NotBlank @Size(max = 2000) String message,
        NotificationType type,
        @NotNull NotificationTarget target,
        UUID classId
) {
    public enum NotificationTarget {
        ALL_STUDENTS,
        CLASS_STUDENTS
    }
}

