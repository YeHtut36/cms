package com.htut.cms.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record PublicOnboardingPaymentRequest(
        @NotBlank @Size(max = 100) String fullName,
        @NotBlank @Size(max = 20) String phone,
        @NotBlank @Email @Size(max = 100) String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotNull UUID classId,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal amountMmk,
        @NotBlank @Size(max = 100) String kpayTransactionId,
        @Size(max = 255) String paymentProofUrl
) {
}

