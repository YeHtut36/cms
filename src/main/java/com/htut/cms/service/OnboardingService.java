package com.htut.cms.service;

import com.htut.cms.dto.request.PublicOnboardingPaymentRequest;
import com.htut.cms.dto.response.PublicOnboardingResponse;
import com.htut.cms.model.ClassStatus;
import com.htut.cms.model.CourseClass;
import com.htut.cms.model.Enrollment;
import com.htut.cms.model.EnrollmentStatus;
import com.htut.cms.model.Payment;
import com.htut.cms.model.PaymentStatus;
import com.htut.cms.model.Role;
import com.htut.cms.model.User;
import com.htut.cms.repository.ClassRepository;
import com.htut.cms.repository.EnrollmentRepository;
import com.htut.cms.repository.PaymentRepository;
import com.htut.cms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class OnboardingService {

    private static final Set<PaymentStatus> BLOCKING_PAYMENT_STATUSES = Set.of(PaymentStatus.PENDING, PaymentStatus.VERIFIED);


    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public PublicOnboardingResponse submitPaymentAndOnboard(PublicOnboardingPaymentRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        String normalizedTransactionId = request.kpayTransactionId().trim().toUpperCase();

        if (paymentRepository.existsByKpayTransactionIdIgnoreCase(normalizedTransactionId)) {
            throw new IllegalArgumentException("KBZ Pay transaction ID is already used.");
        }

        CourseClass courseClass = classRepository.findById(request.classId())
                .orElseThrow(() -> new IllegalArgumentException("Class not found."));

        if (courseClass.getStatus() == ClassStatus.DRAFT || courseClass.getStatus() == ClassStatus.COMPLETED) {
            throw new IllegalArgumentException("This class is not open for registration.");
        }

        if (courseClass.getCurrentEnrollment() >= courseClass.getMaxCapacity()) {
            courseClass.setStatus(ClassStatus.FULL);
            classRepository.save(courseClass);
            throw new IllegalArgumentException("Class is full.");
        }

        if (request.amountMmk().compareTo(courseClass.getPriceMmk()) != 0) {
            throw new IllegalArgumentException("Payment amount must exactly match class price.");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .map(existing -> updateExistingApplicant(existing, request))
                .orElseGet(() -> createNewApplicant(request, normalizedEmail));

        Enrollment enrollment = resolveEnrollment(user, courseClass);

        if (paymentRepository.existsByEnrollment_IdAndStatusIn(enrollment.getId(), BLOCKING_PAYMENT_STATUSES)) {
            throw new IllegalArgumentException("A pending or verified payment already exists for this enrollment.");
        }

        Payment payment = paymentRepository.save(
                Payment.builder()
                        .enrollment(enrollment)
                        .amountMmk(request.amountMmk())
                        .kpayTransactionId(normalizedTransactionId)
                        .paymentProofUrl(trimToNull(request.paymentProofUrl()))
                        .status(PaymentStatus.PENDING)
                        .build()
        );

        return new PublicOnboardingResponse(
                user.getId(),
                enrollment.getId(),
                payment.getId(),
                payment.getStatus(),
                "Payment submitted. HR will verify and activate your account for login."
        );
    }

    private User createNewApplicant(PublicOnboardingPaymentRequest request, String normalizedEmail) {
        User user = User.builder()
                .fullName(request.fullName().trim())
                .phone(request.phone().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.STUDENT)
                .studentId(null)
                .isActive(false)
                .build();

        return userRepository.save(user);
    }

    private User updateExistingApplicant(User existing, PublicOnboardingPaymentRequest request) {
        if (existing.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("This email belongs to a non-student account.");
        }
        if (Boolean.TRUE.equals(existing.getIsActive())) {
            throw new IllegalArgumentException("Account already active. Please login and use student payment flow.");
        }

        existing.setFullName(request.fullName().trim());
        existing.setPhone(request.phone().trim());
        existing.setPasswordHash(passwordEncoder.encode(request.password()));

        return userRepository.save(existing);
    }

    private Enrollment resolveEnrollment(User user, CourseClass courseClass) {
        return enrollmentRepository.findByUser_IdAndCourseClass_Id(user.getId(), courseClass.getId())
                .map(existing -> {
                    if (existing.getStatus() == EnrollmentStatus.CONFIRMED || existing.getStatus() == EnrollmentStatus.COMPLETED) {
                        throw new IllegalArgumentException("You are already confirmed in this class.");
                    }
                    if (existing.getStatus() == EnrollmentStatus.CANCELLED) {
                        existing.setStatus(EnrollmentStatus.PENDING);
                    }
                    return enrollmentRepository.save(existing);
                })
                .orElseGet(() -> enrollmentRepository.save(
                        Enrollment.builder()
                                .user(user)
                                .courseClass(courseClass)
                                .status(EnrollmentStatus.PENDING)
                                .build()
                ));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}

