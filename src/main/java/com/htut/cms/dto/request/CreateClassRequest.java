package com.htut.cms.dto.request;

import com.htut.cms.model.ClassStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateClassRequest(
        @NotBlank @Size(max = 255) String title,
        String description,
        @Size(max = 100) String category,
        @Size(max = 255) String thumbnailUrl,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal priceMmk,
        @Size(max = 255) String kbzQrImageUrl,
        @NotNull @Future LocalDateTime startDate,
        LocalDateTime endDate,
        Integer durationWeeks,
        Integer maxCapacity,
        ClassStatus status,
        @Size(max = 100) String instructorName
) {
}

