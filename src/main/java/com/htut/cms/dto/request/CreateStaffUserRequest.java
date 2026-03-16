package com.htut.cms.dto.request;

import com.htut.cms.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateStaffUserRequest(
        @NotBlank @Size(max = 100) String fullName,
        @NotBlank @Size(max = 20) String phone,
        @NotBlank @Email @Size(max = 100) String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotNull Role role
) {
}

