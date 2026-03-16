package com.htut.cms.controller;

import com.htut.cms.dto.response.EnrollmentResponse;
import com.htut.cms.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/classes/{classId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, UUID>> enrollInClass(
            @PathVariable UUID classId,
            Authentication authentication
    ) {
        UUID enrollmentId = enrollmentService.enroll(classId, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("enrollmentId", enrollmentId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollments(Authentication authentication) {
        return ResponseEntity.ok(enrollmentService.getStudentEnrollments(authentication.getName()));
    }
}

