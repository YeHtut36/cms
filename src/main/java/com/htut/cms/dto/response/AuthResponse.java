package com.htut.cms.dto.response;

import com.htut.cms.model.Role;

import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String tokenType,
        UUID userId,
        String fullName,
        String email,
        String studentId,
        Role role
) {
}

