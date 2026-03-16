package com.htut.cms.config;

import com.htut.cms.service.CustomUserDetailsService;
import com.htut.cms.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StompJwtChannelInterceptorTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private MessageChannel messageChannel;

    @InjectMocks
    private StompJwtChannelInterceptor interceptor;

    @Test
    void shouldAttachAuthenticatedUserOnConnect() {
        String token = "valid-token";
        String email = "student@example.com";
        UserDetails userDetails = User.withUsername(email)
                .password("n/a")
                .authorities("ROLE_STUDENT")
                .build();

        when(jwtUtil.extractUsername(token)).thenReturn(email);
        when(userDetailsService.loadUserByUsername(email)).thenReturn(userDetails);
        when(jwtUtil.isTokenValid(token, userDetails)).thenReturn(true);

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setLeaveMutable(true);
        accessor.setNativeHeader("Authorization", "Bearer " + token);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        Message<?> result = interceptor.preSend(message, messageChannel);
        StompHeaderAccessor resultAccessor = StompHeaderAccessor.wrap(result);

        assertNotNull(resultAccessor.getUser());
        assertEquals(email, resultAccessor.getUser().getName());
    }

    @Test
    void shouldRejectConnectWithoutBearerHeader() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setLeaveMutable(true);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThrows(IllegalArgumentException.class, () -> interceptor.preSend(message, messageChannel));
    }
}

