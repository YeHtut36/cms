package com.htut.cms.controller;

import com.htut.cms.dto.request.CreateClassRequest;
import com.htut.cms.dto.response.ClassResponse;
import com.htut.cms.service.ClassService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassResponse> createClass(
            @Valid @RequestBody CreateClassRequest request,
            Authentication authentication
    ) {
        ClassResponse response = classService.createClass(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'STUDENT')")
    public ResponseEntity<List<ClassResponse>> getVisibleClasses() {
        return ResponseEntity.ok(classService.getVisibleClasses());
    }
}

