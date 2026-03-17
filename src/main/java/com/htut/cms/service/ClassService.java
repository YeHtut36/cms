package com.htut.cms.service;

import com.htut.cms.dto.request.CreateClassRequest;
import com.htut.cms.dto.response.ClassResponse;
import com.htut.cms.model.ClassStatus;
import com.htut.cms.model.CourseClass;
import com.htut.cms.model.User;
import com.htut.cms.repository.ClassRepository;
import com.htut.cms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassRepository classRepository;
    private final UserRepository userRepository;

    @Transactional
    public ClassResponse createClass(CreateClassRequest request, String creatorEmail) {
        validateCreateClassRequest(request);

        User createdBy = userRepository.findByEmailIgnoreCase(creatorEmail)
                .orElseThrow(() -> new IllegalArgumentException("Creator user not found."));

        CourseClass courseClass = CourseClass.builder()
                .title(request.title().trim())
                .description(trimToNull(request.description()))
                .courseIncludes(trimToNull(request.courseIncludes()))
                .category(trimToNull(request.category()))
                .thumbnailUrl(trimToNull(request.thumbnailUrl()))
                .priceMmk(request.priceMmk())
                .kbzQrImageUrl(trimToNull(request.kbzQrImageUrl()))
                .kbzPayPhone(trimToNull(request.kbzPayPhone()))
                .startDate(request.startDate())
                .endDate(request.endDate())
                .durationWeeks(request.durationWeeks())
                .maxCapacity(request.maxCapacity() == null ? 30 : request.maxCapacity())
                .currentEnrollment(0)
                .status(request.status() == null ? ClassStatus.UPCOMING : request.status())
                .instructorName(trimToNull(request.instructorName()))
                .createdBy(createdBy)
                .build();

        return toResponse(classRepository.save(courseClass));
    }

    @Transactional(readOnly = true)
    public List<ClassResponse> getVisibleClasses() {
        return classRepository.findByStatusNotOrderByStartDateAsc(ClassStatus.DRAFT)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClassResponse getPublicClassDetail(UUID classId) {
        CourseClass courseClass = classRepository.findByIdAndStatusNot(classId, ClassStatus.DRAFT)
                .orElseThrow(() -> new IllegalArgumentException("Class not found."));
        return toResponse(courseClass);
    }

    private void validateCreateClassRequest(CreateClassRequest request) {
        if (request.endDate() != null && request.endDate().isBefore(request.startDate())) {
            throw new IllegalArgumentException("End date cannot be before start date.");
        }
        if (request.maxCapacity() != null && request.maxCapacity() <= 0) {
            throw new IllegalArgumentException("Max capacity must be greater than 0.");
        }
        if (request.durationWeeks() != null && request.durationWeeks() <= 0) {
            throw new IllegalArgumentException("Duration weeks must be greater than 0.");
        }
    }

    private ClassResponse toResponse(CourseClass courseClass) {
        return new ClassResponse(
                courseClass.getId(),
                courseClass.getTitle(),
                courseClass.getDescription(),
                courseClass.getCourseIncludes(),
                courseClass.getCategory(),
                courseClass.getThumbnailUrl(),
                courseClass.getPriceMmk(),
                courseClass.getKbzQrImageUrl(),
                courseClass.getKbzPayPhone(),
                courseClass.getStartDate(),
                courseClass.getEndDate(),
                courseClass.getDurationWeeks(),
                courseClass.getMaxCapacity(),
                courseClass.getCurrentEnrollment(),
                courseClass.getStatus(),
                courseClass.getInstructorName(),
                courseClass.getCreatedBy() == null ? null : courseClass.getCreatedBy().getId(),
                courseClass.getCreatedAt(),
                courseClass.getUpdatedAt()
        );
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    @Transactional
    public ClassResponse updateClass(UUID classId, CreateClassRequest request, String editorEmail) {
        validateCreateClassRequest(request);

        CourseClass courseClass = classRepository.findByIdForUpdate(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found."));

        // Optional: enforce creator editing only; current requirement allows admin edit any.

        courseClass.setTitle(request.title().trim());
        courseClass.setDescription(trimToNull(request.description()));
        courseClass.setCourseIncludes(trimToNull(request.courseIncludes()));
        courseClass.setCategory(trimToNull(request.category()));
        courseClass.setThumbnailUrl(trimToNull(request.thumbnailUrl()));
        courseClass.setPriceMmk(request.priceMmk());
        courseClass.setKbzQrImageUrl(trimToNull(request.kbzQrImageUrl()));
        courseClass.setKbzPayPhone(trimToNull(request.kbzPayPhone()));
        courseClass.setStartDate(request.startDate());
        courseClass.setEndDate(request.endDate());
        courseClass.setDurationWeeks(request.durationWeeks());
        courseClass.setMaxCapacity(request.maxCapacity() == null ? 30 : request.maxCapacity());
        courseClass.setStatus(request.status() == null ? ClassStatus.UPCOMING : request.status());
        courseClass.setInstructorName(trimToNull(request.instructorName()));

        return toResponse(courseClass);
    }

    @Transactional
    public void deleteClass(UUID classId) {
        if (!classRepository.existsById(classId)) {
            throw new IllegalArgumentException("Class not found.");
        }
        classRepository.deleteById(classId);
    }
}

