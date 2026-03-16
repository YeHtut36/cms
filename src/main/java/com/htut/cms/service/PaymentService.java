package com.htut.cms.service;

import com.htut.cms.dto.request.PaymentSubmissionRequest;
import com.htut.cms.dto.request.PaymentVerificationRequest;
import com.htut.cms.dto.response.PaymentResponse;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final Set<PaymentStatus> BLOCKING_PAYMENT_STATUSES = Set.of(PaymentStatus.PENDING, PaymentStatus.VERIFIED);

    private final PaymentRepository paymentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final StudentIdGeneratorService studentIdGeneratorService;

    @Transactional
    public PaymentResponse submitPayment(PaymentSubmissionRequest request, String studentEmail) {
        User student = userRepository.findByEmailIgnoreCase(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        if (student.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("Only students can submit payments.");
        }

        Enrollment enrollment = enrollmentRepository.findById(request.enrollmentId())
                .orElseThrow(() -> new IllegalArgumentException("Enrollment not found."));

        if (!enrollment.getUser().getId().equals(student.getId())) {
            throw new IllegalArgumentException("You can only submit payment for your own enrollment.");
        }

        if (enrollment.getStatus() == EnrollmentStatus.CANCELLED || enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            throw new IllegalArgumentException("Payment cannot be submitted for this enrollment status.");
        }

        if (request.amountMmk().compareTo(enrollment.getCourseClass().getPriceMmk()) != 0) {
            throw new IllegalArgumentException("Payment amount must exactly match class price.");
        }

        String normalizedTransactionId = request.kpayTransactionId().trim().toUpperCase();

        if (paymentRepository.existsByKpayTransactionIdIgnoreCase(normalizedTransactionId)) {
            throw new IllegalArgumentException("KBZ Pay transaction ID is already used.");
        }

        if (paymentRepository.existsByEnrollment_IdAndStatusIn(enrollment.getId(), BLOCKING_PAYMENT_STATUSES)) {
            throw new IllegalArgumentException("A pending or verified payment already exists for this enrollment.");
        }

        Payment payment = Payment.builder()
                .enrollment(enrollment)
                .amountMmk(request.amountMmk())
                .kpayTransactionId(normalizedTransactionId)
                .paymentProofUrl(trimToNull(request.paymentProofUrl()))
                .status(PaymentStatus.PENDING)
                .build();

        return toResponse(paymentRepository.save(payment));
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getMyPayments(String studentEmail) {
        User student = userRepository.findByEmailIgnoreCase(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        return paymentRepository.findAllByEnrollment_User_IdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPendingPayments() {
        return paymentRepository.findAllByStatusOrderByCreatedAtAsc(PaymentStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PaymentResponse verifyPayment(UUID paymentId, PaymentVerificationRequest request, String hrEmail) {
        User hrUser = userRepository.findByEmailIgnoreCase(hrEmail)
                .orElseThrow(() -> new IllegalArgumentException("HR user not found."));

        if (hrUser.getRole() != Role.HR && hrUser.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Only HR or ADMIN can verify payments.");
        }

        Payment payment = paymentRepository.findByIdForUpdate(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found."));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalArgumentException("Only pending payments can be verified.");
        }

        if (request.status() != PaymentStatus.VERIFIED && request.status() != PaymentStatus.REJECTED) {
            throw new IllegalArgumentException("Status must be VERIFIED or REJECTED.");
        }

        if (request.status() == PaymentStatus.REJECTED && trimToNull(request.rejectionReason()) == null) {
            throw new IllegalArgumentException("Rejection reason is required when status is REJECTED.");
        }

        payment.setStatus(request.status());
        payment.setVerifiedBy(hrUser);
        payment.setVerifiedAt(LocalDateTime.now());
        payment.setRejectionReason(request.status() == PaymentStatus.REJECTED ? request.rejectionReason().trim() : null);

        if (request.status() == PaymentStatus.VERIFIED) {
            Enrollment enrollment = payment.getEnrollment();
            CourseClass courseClass = classRepository.findByIdForUpdate(enrollment.getCourseClass().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Class not found."));

            if (courseClass.getCurrentEnrollment() >= courseClass.getMaxCapacity()) {
                courseClass.setStatus(ClassStatus.FULL);
                classRepository.save(courseClass);
                throw new IllegalArgumentException("Class is already full. Cannot verify this payment.");
            }

            enrollment.setStatus(EnrollmentStatus.CONFIRMED);
            courseClass.setCurrentEnrollment(courseClass.getCurrentEnrollment() + 1);
            if (courseClass.getCurrentEnrollment() >= courseClass.getMaxCapacity()) {
                courseClass.setStatus(ClassStatus.FULL);
            }
            classRepository.save(courseClass);

            User student = enrollment.getUser();
            if (student.getStudentId() == null || student.getStudentId().isBlank()) {
                student.setStudentId(studentIdGeneratorService.generate());
            }
            student.setIsActive(true);
        } else {
            payment.getEnrollment().setStatus(EnrollmentStatus.PENDING);
        }

        return toResponse(paymentRepository.save(payment));
    }

    private PaymentResponse toResponse(Payment payment) {
        Enrollment enrollment = payment.getEnrollment();
        User student = enrollment.getUser();

        return new PaymentResponse(
                payment.getId(),
                enrollment.getId(),
                enrollment.getCourseClass().getId(),
                enrollment.getCourseClass().getTitle(),
                student.getId(),
                student.getFullName(),
                payment.getAmountMmk(),
                payment.getKpayTransactionId(),
                payment.getPaymentProofUrl(),
                payment.getStatus(),
                payment.getVerifiedBy() == null ? null : payment.getVerifiedBy().getId(),
                payment.getVerifiedAt(),
                payment.getRejectionReason(),
                payment.getCreatedAt()
        );
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}

