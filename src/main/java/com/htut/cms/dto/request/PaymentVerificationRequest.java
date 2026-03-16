package com.htut.cms.dto.request;

import com.htut.cms.model.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PaymentVerificationRequest(
        @NotNull PaymentStatus status,
        @Size(max = 1000) String rejectionReason
) {
}

