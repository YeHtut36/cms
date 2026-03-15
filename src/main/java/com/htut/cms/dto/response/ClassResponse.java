package com.htut.cms.dto.response;

import com.htut.cms.model.ClassStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ClassResponse(
        UUID id,
        String title,
        String description,
        String category,
        String thumbnailUrl,
        BigDecimal priceMmk,
        String kbzQrImageUrl,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Integer durationWeeks,
        Integer maxCapacity,
        Integer currentEnrollment,
        ClassStatus status,
        String instructorName,
        UUID createdBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

