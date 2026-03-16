package com.htut.cms.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record ChatMessageResponse(
        UUID id,
        UUID classId,
        UUID senderId,
        String senderName,
        String message,
        LocalDateTime createdAt
) {
}

