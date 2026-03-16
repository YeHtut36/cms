package com.htut.cms.repository;

import com.htut.cms.model.Payment;
import com.htut.cms.model.PaymentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    boolean existsByKpayTransactionIdIgnoreCase(String kpayTransactionId);

    boolean existsByEnrollment_IdAndStatusIn(UUID enrollmentId, Collection<PaymentStatus> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Payment p where p.id = :id")
    Optional<Payment> findByIdForUpdate(@Param("id") UUID id);

    List<Payment> findAllByStatusOrderByCreatedAtAsc(PaymentStatus status);

    List<Payment> findAllByEnrollment_User_IdOrderByCreatedAtDesc(UUID userId);
}

