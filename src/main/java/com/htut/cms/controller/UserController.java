package com.htut.cms.controller;

import com.htut.cms.dto.request.CreateStaffUserRequest;
import com.htut.cms.dto.response.UserProfileResponse;
import com.htut.cms.service.UserService;
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
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getMyProfile(authentication.getName()));
    }

    @PostMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> createStaff(@Valid @RequestBody CreateStaffUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createStaffUser(request));
    }

    @GetMapping("/students/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<UserProfileResponse>> getPendingStudents() {
        return ResponseEntity.ok(userService.getPendingStudents());
    }
}

