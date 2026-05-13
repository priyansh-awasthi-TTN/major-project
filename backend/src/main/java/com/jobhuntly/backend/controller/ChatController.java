package com.jobhuntly.backend.controller;

import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.repository.UserRepository;
import com.jobhuntly.backend.service.ChatService;
import com.jobhuntly.backend.service.JwtService;
import com.jobhuntly.backend.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private TokenService tokenService;

    private User resolveUser(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) return null;
        String token = header.substring(7);
        if (!tokenService.isAccessTokenValid(token)) return null;
        String email = jwtService.extractUsername(token);
        return userRepository.findByEmailAndIsActiveTrue(email).orElse(null);
    }

    // GET /api/chat/conversations
    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(HttpServletRequest request) {
        User user = resolveUser(request);
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        return ResponseEntity.ok(chatService.getConversations(user.getEmail()));
    }

    // GET /api/chat/messages/{userId}
    @GetMapping("/messages/{otherUserId}")
    public ResponseEntity<?> getMessages(@PathVariable Long otherUserId, HttpServletRequest request) {
        User user = resolveUser(request);
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        return ResponseEntity.ok(chatService.getMessagesBetweenUsers(user.getEmail(), otherUserId));
    }

    // POST /api/chat/mark-read/{userId}
    @PostMapping("/mark-read/{otherUserId}")
    public ResponseEntity<?> markAsRead(@PathVariable Long otherUserId, HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
            chatService.markMessagesAsRead(user.getEmail(), otherUserId);
            return ResponseEntity.ok(Map.of("message", "Marked as read"));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // GET /api/chat/unread-count
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(HttpServletRequest request) {
        User user = resolveUser(request);
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        long count = chatService.getUnreadMessageCount(user.getEmail());
        return ResponseEntity.ok(Map.of("count", count));
    }

    // GET /api/chat/unread-count/{userId}
    @GetMapping("/unread-count/{otherUserId}")
    public ResponseEntity<?> getUnreadCountBetweenUsers(@PathVariable Long otherUserId, HttpServletRequest request) {
        User user = resolveUser(request);
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        long count = chatService.getUnreadMessageCountBetweenUsers(user.getEmail(), otherUserId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}

// Separate @Controller for WebSocket mappings
@Controller
class ChatWebSocketController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private TokenService tokenService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessagePayload payload, SimpMessageHeaderAccessor headers) {
        User sender = resolveSender(payload, headers);
        if (sender != null) {
            chatService.sendMessage(
                sender.getEmail(),
                payload.getRecipientId(),
                payload.getContent(),
                payload.getMessageType(),
                payload.getFileUrl()
            );
        }
    }

    private User resolveSender(ChatMessagePayload payload, SimpMessageHeaderAccessor headers) {
        if (payload.getSenderId() == null) {
            return null;
        }

        String token = extractBearerToken(headers);
        if (token == null || !tokenService.isAccessTokenValid(token)) {
            return null;
        }

        String email = jwtService.extractUsername(token);
        User sender = userRepository.findByEmailAndIsActiveTrue(email).orElse(null);
        if (sender == null || !sender.getId().equals(payload.getSenderId())) {
            return null;
        }

        return sender;
    }

    private String extractBearerToken(SimpMessageHeaderAccessor headers) {
        List<String> values = headers.getNativeHeader("Authorization");
        if (values == null || values.isEmpty()) {
            return null;
        }

        String authorization = values.get(0);
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }

        return authorization.substring(7);
    }

    public static class ChatMessagePayload {
        private Long senderId;
        private Long recipientId;
        private String content;
        private String messageType;
        private String fileUrl;

        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }

        public Long getRecipientId() { return recipientId; }
        public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public String getMessageType() { return messageType; }
        public void setMessageType(String messageType) { this.messageType = messageType; }

        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    }
}
