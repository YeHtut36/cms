package com.htut.cms.controller;

import com.htut.cms.dto.request.SendChatMessageRequest;
import com.htut.cms.dto.response.ChatMessageResponse;
import com.htut.cms.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chat/classes/{classId}/messages")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'HR', 'ADMIN')")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @PathVariable UUID classId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(chatService.getClassMessages(classId, authentication.getName()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'HR', 'ADMIN')")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @PathVariable UUID classId,
            @Valid @RequestBody SendChatMessageRequest request,
            Authentication authentication
    ) {
        ChatMessageResponse response = chatService.sendMessage(classId, request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

