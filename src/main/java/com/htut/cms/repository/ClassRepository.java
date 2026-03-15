package com.htut.cms.repository;

import com.htut.cms.model.ClassStatus;
import com.htut.cms.model.CourseClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClassRepository extends JpaRepository<CourseClass, UUID> {

    List<CourseClass> findByStatusNotOrderByStartDateAsc(ClassStatus status);
}

