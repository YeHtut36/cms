package com.htut.cms.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentSubmissionRequest(
        @NotNull UUID enrollmentId,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal amountMmk,
        @NotBlank @Size(max = 100) String kpayTransactionId,
        @Size(max = 255) String paymentProofUrl
) {
}

