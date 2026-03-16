package com.htut.cms.service;

import com.htut.cms.dto.request.SendChatMessageRequest;
import com.htut.cms.dto.response.ChatMessageResponse;
import com.htut.cms.model.ChatMessage;
import com.htut.cms.model.CourseClass;
import com.htut.cms.model.EnrollmentStatus;
import com.htut.cms.model.Role;
import com.htut.cms.model.User;
import com.htut.cms.repository.ChatMessageRepository;
import com.htut.cms.repository.ClassRepository;
import com.htut.cms.repository.EnrollmentRepository;
import com.htut.cms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional
    public ChatMessageResponse sendMessage(UUID classId, SendChatMessageRequest request, String email) {
        User sender = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        CourseClass courseClass = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found."));

        ensureCanAccessClassChat(sender, classId);

        ChatMessage saved = chatMessageRepository.save(
                ChatMessage.builder()
                        .courseClass(courseClass)
                        .sender(sender)
                        .message(request.message().trim())
                        .build()
        );

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getClassMessages(UUID classId, String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        ensureCanAccessClassChat(user, classId);

        return chatMessageRepository.findTop200ByCourseClass_IdOrderByCreatedAtDesc(classId)
                .stream()
                .sorted(Comparator.comparing(ChatMessage::getCreatedAt))
                .map(this::toResponse)
                .toList();
    }

    private void ensureCanAccessClassChat(User user, UUID classId) {
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.HR) {
            return;
        }

        boolean isConfirmedStudent = enrollmentRepository.existsByUser_IdAndCourseClass_IdAndStatus(
                user.getId(),
                classId,
                EnrollmentStatus.CONFIRMED
        );

        if (!isConfirmedStudent) {
            throw new IllegalArgumentException("You are not a confirmed student of this class.");
        }
    }

    private ChatMessageResponse toResponse(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getCourseClass().getId(),
                message.getSender().getId(),
                message.getSender().getFullName(),
                message.getMessage(),
                message.getCreatedAt()
        );
    }
}

