package com.htut.cms.service;

import com.htut.cms.dto.request.LoginRequest;
import com.htut.cms.dto.request.RegisterRequest;
import com.htut.cms.dto.response.AuthResponse;
import com.htut.cms.model.User;
import com.htut.cms.repository.UserRepository;
import com.htut.cms.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        throw new IllegalStateException("Direct registration is disabled. Submit onboarding form via /api/v1/public/onboarding/payments.");
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
            );
        } catch (DisabledException ex) {
            throw new IllegalArgumentException("Your account is not active yet. Please wait for HR payment verification.");
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

