package com.htut.cms.repository;

import com.htut.cms.model.Role;
import com.htut.cms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByStudentId(String studentId);

    List<User> findAllByRoleAndIsActiveTrue(Role role);

    List<User> findAllByRoleAndIsActive(Role role, Boolean isActive);
}

