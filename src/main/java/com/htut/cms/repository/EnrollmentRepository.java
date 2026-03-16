package com.htut.cms.repository;

import com.htut.cms.model.Enrollment;
import com.htut.cms.model.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    boolean existsByUser_IdAndCourseClass_Id(UUID userId, UUID classId);

    List<Enrollment> findAllByUser_IdOrderByEnrolledAtDesc(UUID userId);

    Optional<Enrollment> findByUser_IdAndCourseClass_Id(UUID userId, UUID classId);

    List<Enrollment> findAllByCourseClass_IdAndStatus(UUID classId, EnrollmentStatus status);

    boolean existsByUser_IdAndCourseClass_IdAndStatus(UUID userId, UUID classId, EnrollmentStatus status);
}

