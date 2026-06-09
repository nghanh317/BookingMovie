package com.example.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // "/topic" dùng cho tin nhắn chung (ví dụ: khoá ghế phòng chiếu)
        // "/queue" dùng cho tin nhắn cá nhân (ví dụ: thông báo user)
        config.enableSimpleBroker("/topic", "/queue");
        
        // Client sẽ gửi message lên bắt đầu bằng "/app"
        config.setApplicationDestinationPrefixes("/app");
        
        // Prefix dùng cho các tin nhắn user-specific
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Cho phép React kết nối từ port khác
                .withSockJS(); // Fallback nếu trình duyệt không hỗ trợ WebSocket
    }
}