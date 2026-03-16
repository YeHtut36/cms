package com.htut.cms.dto.response;

import com.htut.cms.model.Role;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String studentId,
        String fullName,
        String phone,
        String email,
        Role role,
        Boolean isActive,
        LocalDateTime createdAt
) {
}

