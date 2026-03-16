package com.htut.cms.controller;

import com.htut.cms.dto.request.SendChatMessageRequest;
import com.htut.cms.dto.response.ChatMessageResponse;
import com.htut.cms.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ChatWsController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/classes/{classId}/messages")
    public void sendMessage(
            @DestinationVariable UUID classId,
            @Valid @Payload SendChatMessageRequest request,
            Principal principal
    ) {
        if (principal == null) {
            throw new IllegalArgumentException("Unauthenticated WebSocket session.");
        }

        ChatMessageResponse response = chatService.sendMessage(classId, request, principal.getName());
        messagingTemplate.convertAndSend("/topic/classes/" + classId + "/chat", response);
    }
}

