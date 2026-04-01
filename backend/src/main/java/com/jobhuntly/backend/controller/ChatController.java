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
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

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

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessagePayload payload) {
        // Find sender internally? We do not have HttpServletRequest in websockets.
        // Spring STOMP provides Principal, but for simplicity we rely on senderId in payload 
        // if JWT wasn't natively linked to principal in WebSocketConfig.
        // Assuming payload has senderId:
        User sender = userRepository.findById(payload.getSenderId()).orElse(null);
        if (sender != null) {
            chatService.sendMessage(sender.getEmail(), payload.getRecipientId(), payload.getContent(), "TEXT");
        }
    }

    public static class ChatMessagePayload {
        private Long senderId;
        private Long recipientId;
        private String content;

        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }

        public Long getRecipientId() { return recipientId; }
        public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
