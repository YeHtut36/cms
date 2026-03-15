package com.htut.cms.service;

import com.htut.cms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class StudentIdGeneratorService {

    private static final String PREFIX = "STU24";
    private static final int MAX_ATTEMPTS = 50;

    private final UserRepository userRepository;

    public String generate() {
        String currentYear = String.valueOf(Year.now().getValue());

        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            int serial = ThreadLocalRandom.current().nextInt(0, 10000);
            String candidate = PREFIX + currentYear + String.format("%04d", serial);
            if (!userRepository.existsByStudentId(candidate)) {
                return candidate;
            }
        }

        throw new IllegalStateException("Unable to generate unique student ID.");
    }
}

