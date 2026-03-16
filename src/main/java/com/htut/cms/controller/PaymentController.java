package com.htut.cms.controller;

import com.htut.cms.dto.request.PaymentSubmissionRequest;
import com.htut.cms.dto.request.PaymentVerificationRequest;
import com.htut.cms.dto.response.PaymentResponse;
import com.htut.cms.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PaymentResponse> submitPayment(
            @Valid @RequestBody PaymentSubmissionRequest request,
            Authentication authentication
    ) {
        PaymentResponse response = paymentService.submitPayment(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<PaymentResponse>> getMyPayments(Authentication authentication) {
        return ResponseEntity.ok(paymentService.getMyPayments(authentication.getName()));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getPendingPayments() {
        return ResponseEntity.ok(paymentService.getPendingPayments());
    }

    @PatchMapping("/{paymentId}/verify")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<PaymentResponse> verifyPayment(
            @PathVariable UUID paymentId,
            @Valid @RequestBody PaymentVerificationRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(paymentService.verifyPayment(paymentId, request, authentication.getName()));
    }
}

