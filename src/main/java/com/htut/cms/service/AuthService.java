package com.htut.cms.service;

import com.htut.cms.dto.request.LoginRequest;
import com.htut.cms.dto.request.RegisterRequest;
import com.htut.cms.dto.response.AuthResponse;
import com.htut.cms.model.Role;
import com.htut.cms.model.User;
import com.htut.cms.repository.UserRepository;
import com.htut.cms.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final StudentIdGeneratorService studentIdGeneratorService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        Role role = request.role() == null ? Role.STUDENT : request.role();
        String studentId = role == Role.STUDENT ? studentIdGeneratorService.generate() : null;

        User user = User.builder()
                .fullName(request.fullName().trim())
                .phone(request.phone().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(role)
                .studentId(studentId)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser);

        return buildAuthResponse(savedUser, token);
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
            );
        } catch (BadCredentialsException ex) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        String token = jwtUtil.generateToken(user);
        return buildAuthResponse(user, token);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getStudentId(),
                user.getRole()
        );
    }
}

