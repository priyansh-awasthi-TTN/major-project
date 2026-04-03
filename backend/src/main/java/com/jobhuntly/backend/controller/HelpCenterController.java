package com.jobhuntly.backend.controller;

import com.jobhuntly.backend.dto.HelpArticleFeedbackRequest;
import com.jobhuntly.backend.dto.HelpSupportTicketRequest;
import com.jobhuntly.backend.entity.HelpArticle;
import com.jobhuntly.backend.entity.HelpArticleFeedback;
import com.jobhuntly.backend.entity.HelpSupportTicket;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.repository.HelpArticleFeedbackRepository;
import com.jobhuntly.backend.repository.HelpArticleRepository;
import com.jobhuntly.backend.repository.HelpSupportTicketRepository;
import com.jobhuntly.backend.repository.UserRepository;
import com.jobhuntly.backend.service.JwtService;
import com.jobhuntly.backend.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/help-center")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class HelpCenterController {

    @Autowired
    private HelpArticleRepository helpArticleRepository;
    @Autowired
    private HelpArticleFeedbackRepository helpArticleFeedbackRepository;
    @Autowired
    private HelpSupportTicketRepository helpSupportTicketRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private TokenService tokenService;

    private User resolveUser(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized");
        }

        String token = header.substring(7);
        if (!tokenService.isAccessTokenValid(token)) {
            throw new RuntimeException("Invalid token");
        }

        String email = jwtService.extractUsername(token);
        return userRepository.findByEmailAndIsActiveTrue(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Map<String, Object> toArticleMap(HelpArticle article, HelpArticleFeedback feedback) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", article.getId());
        data.put("category", article.getCategory());
        data.put("q", article.getQuestion());
        data.put("a", article.getAnswer());
        data.put("date", article.getPublishedAt() != null ? article.getPublishedAt().toString() : null);
        data.put("helpful", feedback != null && feedback.getHelpful() != null
            ? (feedback.getHelpful() ? "yes" : "no")
            : null);
        data.put("reported", feedback != null && Boolean.TRUE.equals(feedback.getReported()));
        return data;
    }

    private Map<String, Object> toTicketMap(HelpSupportTicket ticket) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", ticket.getId());
        data.put("name", ticket.getContactName());
        data.put("email", ticket.getContactEmail());
        data.put("subject", ticket.getSubject());
        data.put("message", ticket.getMessage());
        data.put("status", ticket.getStatus().name());
        data.put("createdAt", ticket.getCreatedAt() != null ? ticket.getCreatedAt().toString() : null);
        return data;
    }

    @GetMapping("/articles")
    public ResponseEntity<?> getArticles(HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            List<HelpArticle> articles = helpArticleRepository.findByIsActiveTrueOrderBySortOrderAsc();
            Map<Long, HelpArticleFeedback> feedbackByArticleId = new HashMap<>();

            for (HelpArticleFeedback feedback : helpArticleFeedbackRepository.findByUser(user)) {
                if (feedback.getArticle() != null) {
                    feedbackByArticleId.put(feedback.getArticle().getId(), feedback);
                }
            }

            List<Map<String, Object>> result = new ArrayList<>();
            for (HelpArticle article : articles) {
                result.add(toArticleMap(article, feedbackByArticleId.get(article.getId())));
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/articles/{articleId}/feedback")
    public ResponseEntity<?> saveFeedback(
        @PathVariable Long articleId,
        @RequestBody HelpArticleFeedbackRequest body,
        HttpServletRequest request
    ) {
        try {
            User user = resolveUser(request);
            if (body.getHelpful() == null) {
                throw new RuntimeException("Helpful value is required");
            }

            HelpArticle article = helpArticleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

            HelpArticleFeedback feedback = helpArticleFeedbackRepository
                .findByUserAndArticle(user, article)
                .orElseGet(() -> {
                    HelpArticleFeedback created = new HelpArticleFeedback();
                    created.setUser(user);
                    created.setArticle(article);
                    return created;
                });

            feedback.setHelpful(body.getHelpful());
            HelpArticleFeedback saved = helpArticleFeedbackRepository.save(feedback);

            return ResponseEntity.ok(Map.of(
                "articleId", articleId,
                "helpful", Boolean.TRUE.equals(saved.getHelpful()) ? "yes" : "no",
                "reported", Boolean.TRUE.equals(saved.getReported())
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/articles/{articleId}/report")
    public ResponseEntity<?> reportArticle(@PathVariable Long articleId, HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            HelpArticle article = helpArticleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

            HelpArticleFeedback feedback = helpArticleFeedbackRepository
                .findByUserAndArticle(user, article)
                .orElseGet(() -> {
                    HelpArticleFeedback created = new HelpArticleFeedback();
                    created.setUser(user);
                    created.setArticle(article);
                    return created;
                });

            feedback.setReported(true);
            HelpArticleFeedback saved = helpArticleFeedbackRepository.save(feedback);

            return ResponseEntity.ok(Map.of(
                "articleId", articleId,
                "reported", Boolean.TRUE.equals(saved.getReported())
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/tickets")
    public ResponseEntity<?> createTicket(@RequestBody HelpSupportTicketRequest body, HttpServletRequest request) {
        try {
            User user = resolveUser(request);

            String name = body.getName() != null && !body.getName().trim().isEmpty()
                ? body.getName().trim()
                : user.getFullName();
            String email = body.getEmail() != null && !body.getEmail().trim().isEmpty()
                ? body.getEmail().trim()
                : user.getEmail();
            String subject = body.getSubject() != null ? body.getSubject().trim() : "";
            String message = body.getMessage() != null ? body.getMessage().trim() : "";

            if (subject.isEmpty()) {
                throw new RuntimeException("Subject is required");
            }
            if (message.isEmpty()) {
                throw new RuntimeException("Message is required");
            }

            HelpSupportTicket ticket = new HelpSupportTicket();
            ticket.setUser(user);
            ticket.setContactName(name);
            ticket.setContactEmail(email);
            ticket.setSubject(subject);
            ticket.setMessage(message);
            ticket.setStatus(HelpSupportTicket.Status.OPEN);

            return ResponseEntity.ok(toTicketMap(helpSupportTicketRepository.save(ticket)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/tickets")
    public ResponseEntity<?> getTickets(HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            List<Map<String, Object>> result = new ArrayList<>();
            for (HelpSupportTicket ticket : helpSupportTicketRepository.findByUserOrderByCreatedAtDesc(user)) {
                result.add(toTicketMap(ticket));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
