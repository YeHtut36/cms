package com.htut.cms.dto.response;

import com.htut.cms.model.PaymentStatus;

import java.util.UUID;

public record PublicOnboardingResponse(
        UUID userId,
        UUID enrollmentId,
        UUID paymentId,
        PaymentStatus paymentStatus,
        String message
) {
}

