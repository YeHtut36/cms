package com.htut.cms.repository;

import com.htut.cms.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    boolean existsByUser_IdAndCourseClass_Id(UUID userId, UUID classId);

    List<Enrollment> findAllByUser_IdOrderByEnrolledAtDesc(UUID userId);
}

