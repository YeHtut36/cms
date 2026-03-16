package com.htut.cms.repository;

import com.htut.cms.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findTop200ByCourseClass_IdOrderByCreatedAtDesc(UUID classId);
}

