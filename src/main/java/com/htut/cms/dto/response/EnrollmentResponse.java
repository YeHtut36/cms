package com.htut.cms.dto.response;

import com.htut.cms.model.EnrollmentStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record EnrollmentResponse(
        UUID enrollmentId,
        UUID classId,
        String classTitle,
        EnrollmentStatus status,
        LocalDateTime enrolledAt
) {
}

