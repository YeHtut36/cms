package com.htut.cms.repository;

import com.htut.cms.model.ClassStatus;
import com.htut.cms.model.CourseClass;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClassRepository extends JpaRepository<CourseClass, UUID> {

    List<CourseClass> findByStatusNotOrderByStartDateAsc(ClassStatus status);

    Optional<CourseClass> findByIdAndStatusNot(UUID id, ClassStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from CourseClass c where c.id = :id")
    Optional<CourseClass> findByIdForUpdate(@Param("id") UUID id);
}

