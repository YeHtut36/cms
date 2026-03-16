package com.htut.cms.service;

import com.htut.cms.dto.request.CreateStaffUserRequest;
import com.htut.cms.dto.response.UserProfileResponse;
import com.htut.cms.model.Role;
import com.htut.cms.model.User;
import com.htut.cms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserProfileResponse createStaffUser(CreateStaffUserRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (request.role() != Role.ADMIN && request.role() != Role.HR) {
            throw new IllegalArgumentException("Only ADMIN or HR roles are allowed for this endpoint.");
        }

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        User user = User.builder()
                .fullName(request.fullName().trim())
                .phone(request.phone().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .isActive(true)
                .build();

        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getPendingStudents() {
        return userRepository.findAllByRoleAndIsActive(Role.STUDENT, false)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getStudentId(),
                user.getFullName(),
                user.getPhone(),
                user.getEmail(),
                user.getRole(),
                user.getIsActive(),
                user.getCreatedAt()
        );
    }
}

