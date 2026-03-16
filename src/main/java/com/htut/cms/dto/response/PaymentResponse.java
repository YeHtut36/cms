package com.htut.cms.dto.response;

import com.htut.cms.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID enrollmentId,
        UUID classId,
        String classTitle,
        UUID studentId,
        String studentName,
        BigDecimal amountMmk,
        String kpayTransactionId,
        String paymentProofUrl,
        PaymentStatus status,
        UUID verifiedBy,
        LocalDateTime verifiedAt,
        String rejectionReason,
        LocalDateTime createdAt
) {
}

