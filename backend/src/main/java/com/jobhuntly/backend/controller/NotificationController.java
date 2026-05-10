package com.jobhuntly.backend.controller;

import com.jobhuntly.backend.entity.Notification;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.repository.NotificationRepository;
import com.jobhuntly.backend.repository.UserRepository;
import com.jobhuntly.backend.service.JwtService;
import com.jobhuntly.backend.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000" })
public class NotificationController {

    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtService jwtService;
    @Autowired private TokenService tokenService;

    private User resolveUser(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) throw new RuntimeException("Unauthorized");
        String token = header.substring(7);
        if (!tokenService.isAccessTokenValid(token)) throw new RuntimeException("Invalid token");
        String email = jwtService.extractUsername(token);
        return userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Map<String, Object> toMap(Notification notification) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", notification.getId());
        m.put("actorName", notification.getActorName());
        m.put("category", notification.getCategory());
        m.put("type", notification.getType());
        m.put("text", notification.getText());
        m.put("badge", notification.getBadge());
        m.put("badgeColor", notification.getBadgeColor());
        m.put("read", notification.getRead() != null && notification.getRead());
        m.put("createdAt", notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : null);
        return m;
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            List<Map<String, Object>> result = new ArrayList<>();
            for (Notification notification : notificationRepository.findByRecipientOrderByCreatedAtDesc(user)) {
                result.add(toMap(notification));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id, HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            Notification notification = notificationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Notification not found"));
            if (!notification.getRecipient().getId().equals(user.getId())) {
                return ResponseEntity.status(403).build();
            }
            notification.setRead(true);
            notificationRepository.save(notification);
            return ResponseEntity.ok(toMap(notification));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllRead(HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
            for (Notification notification : notifications) {
                notification.setRead(true);
            }
            notificationRepository.saveAll(notifications);
            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}

