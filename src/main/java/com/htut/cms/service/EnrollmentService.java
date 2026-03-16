package com.htut.cms.service;

import com.htut.cms.dto.response.EnrollmentResponse;
import com.htut.cms.model.ClassStatus;
import com.htut.cms.model.CourseClass;
import com.htut.cms.model.Enrollment;
import com.htut.cms.model.EnrollmentStatus;
import com.htut.cms.model.Role;
import com.htut.cms.model.User;
import com.htut.cms.repository.ClassRepository;
import com.htut.cms.repository.EnrollmentRepository;
import com.htut.cms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;

    @Transactional
    public UUID enroll(UUID classId, String studentEmail) {
        User student = userRepository.findByEmailIgnoreCase(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        if (student.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("Only students can enroll in classes.");
        }

        CourseClass courseClass = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found."));

        if (courseClass.getStatus() == ClassStatus.DRAFT || courseClass.getStatus() == ClassStatus.COMPLETED) {
            throw new IllegalArgumentException("This class is not open for enrollment.");
        }

        if (enrollmentRepository.existsByUser_IdAndCourseClass_Id(student.getId(), classId)) {
            throw new IllegalArgumentException("You are already enrolled in this class.");
        }

        if (courseClass.getCurrentEnrollment() >= courseClass.getMaxCapacity()) {
            courseClass.setStatus(ClassStatus.FULL);
            classRepository.save(courseClass);
            throw new IllegalArgumentException("Class is full.");
        }

        Enrollment enrollment = Enrollment.builder()
                .user(student)
                .courseClass(courseClass)
                .status(EnrollmentStatus.PENDING)
                .build();

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        return savedEnrollment.getId();
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getStudentEnrollments(String studentEmail) {
        User student = userRepository.findByEmailIgnoreCase(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        return enrollmentRepository.findAllByUser_IdOrderByEnrolledAtDesc(student.getId())
                .stream()
                .map(enrollment -> new EnrollmentResponse(
                        enrollment.getId(),
                        enrollment.getCourseClass().getId(),
                        enrollment.getCourseClass().getTitle(),
                        enrollment.getStatus(),
                        enrollment.getEnrolledAt()
                ))
                .toList();
    }
}

