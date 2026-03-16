package com.htut.cms.controller;

import com.htut.cms.dto.request.PublicOnboardingPaymentRequest;
import com.htut.cms.dto.response.ClassResponse;
import com.htut.cms.dto.response.PublicOnboardingResponse;
import com.htut.cms.service.ClassService;
import com.htut.cms.service.OnboardingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicController {

    private final ClassService classService;
    private final OnboardingService onboardingService;

    @GetMapping("/classes")
    public ResponseEntity<List<ClassResponse>> getPublicClasses() {
        return ResponseEntity.ok(classService.getVisibleClasses());
    }

    @GetMapping("/classes/{classId}")
    public ResponseEntity<ClassResponse> getPublicClassDetail(@PathVariable UUID classId) {
        return ResponseEntity.ok(classService.getPublicClassDetail(classId));
    }

    @PostMapping("/onboarding/payments")
    public ResponseEntity<PublicOnboardingResponse> submitOnboardingPayment(
            @Valid @RequestBody PublicOnboardingPaymentRequest request
    ) {
        PublicOnboardingResponse response = onboardingService.submitPaymentAndOnboard(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

