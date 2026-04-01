package com.jobhuntly.backend.controller;

import com.jobhuntly.backend.dto.ApplicationRequest;
import com.jobhuntly.backend.entity.Application;
import com.jobhuntly.backend.entity.Job;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.repository.ApplicationRepository;
import com.jobhuntly.backend.repository.JobRepository;
import com.jobhuntly.backend.service.JwtService;
import com.jobhuntly.backend.service.TokenService;
import com.jobhuntly.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class ApplicationController {

    @Autowired
    private ApplicationRepository applicationRepository;
    @Autowired
    private JobRepository jobRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private TokenService tokenService;

    private User resolveUser(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer "))
            throw new RuntimeException("Unauthorized");
        String token = header.substring(7);
        if (!tokenService.isAccessTokenValid(token))
            throw new RuntimeException("Invalid token");
        String email = jwtService.extractUsername(token);
        return userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Map<String, Object> toMap(Application a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", a.getId());
        m.put("jobId", a.getJobId());
        m.put("company", a.getCompany());
        m.put("logo", a.getLogo() != null ? a.getLogo()
                : a.getCompany().substring(0, Math.min(2, a.getCompany().length())).toUpperCase());
        m.put("color", a.getColor() != null ? a.getColor() : "bg-blue-600");
        m.put("location", a.getLocation());
        m.put("title", a.getTitle());
        m.put("type", a.getType());
        m.put("dateApplied", a.getDateApplied() != null ? a.getDateApplied().toString() : null);
        m.put("status", a.getStatus());
        m.put("salary", a.getSalary());
        m.put("note", a.getNote());
        m.put("resumeUrl", a.getResumeUrl());
        m.put("coverLetter", a.getCoverLetter());
        return m;
    }

    // GET /api/applications — all applications for current user
    @GetMapping
    public ResponseEntity<?> getAll(HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            List<Map<String, Object>> result = new ArrayList<>();
            for (Application a : applicationRepository.findByUserOrderByDateAppliedDesc(user)) {
                result.add(toMap(a));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // GET /api/applications/stats — dashboard stats
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            long total = applicationRepository.countByUser(user);
            long interviewing = applicationRepository.countByUserAndStatus(user, "Interviewing");
            long hired = applicationRepository.countByUserAndStatus(user, "Hired");

            List<Object[]> statusCounts = applicationRepository.countByUserGroupByStatus(user);
            Map<String, Long> byStatus = new LinkedHashMap<>();
            for (Object[] row : statusCounts) {
                byStatus.put((String) row[0], (Long) row[1]);
            }

            // Recent 5
            List<Map<String, Object>> recent = new ArrayList<>();
            for (Application a : applicationRepository.findTop5ByUserOrderByDateAppliedDesc(user)) {
                recent.add(toMap(a));
            }

            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("totalApplied", total);
            stats.put("interviewing", interviewing);
            stats.put("hired", hired);
            stats.put("byStatus", byStatus);
            stats.put("recentApplications", recent);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // GET /api/applications/check/{jobId}
    @GetMapping("/check/{jobId}")
    public ResponseEntity<?> checkStatus(@PathVariable Long jobId, HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            boolean applied = applicationRepository.existsByUserAndJobId(user, jobId);
            return ResponseEntity.ok(Map.of("applied", applied));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ApplicationRequest req, HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            if (req.getJobId() != null && applicationRepository.existsByUserAndJobId(user, req.getJobId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "You have already applied for this job."));
            }
            Application app = new Application();
            app.setUser(user);
            app.setJobId(req.getJobId());
            app.setCompany(req.getCompany());
            app.setLogo(req.getLogo());
            app.setColor(req.getColor());
            app.setLocation(req.getLocation());
            app.setTitle(req.getTitle());
            app.setType(req.getType());
            app.setDateApplied(req.getDateApplied() != null ? req.getDateApplied() : LocalDate.now());
            app.setStatus(req.getStatus() != null ? req.getStatus() : "In Review");
            app.setSalary(req.getSalary());
            app.setNote(req.getNote());
            app.setResumeUrl(req.getResumeUrl());
            app.setCoverLetter(req.getCoverLetter());
            Application saved = applicationRepository.save(app);

            // Increment applied count on the job
            if (req.getJobId() != null) {
                jobRepository.findById(req.getJobId()).ifPresent(job -> {
                    job.setApplied((job.getApplied() != null ? job.getApplied() : 0) + 1);
                    jobRepository.save(job);
                });
            }

            return ResponseEntity.ok(toMap(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // PATCH /api/applications/{id}/status — update status
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            Application app = applicationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));
            if (!app.getUser().getId().equals(user.getId()))
                return ResponseEntity.status(403).build();
            app.setStatus(body.get("status"));
            return ResponseEntity.ok(toMap(applicationRepository.save(app)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // DELETE /api/applications/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            Application app = applicationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));
            if (!app.getUser().getId().equals(user.getId()))
                return ResponseEntity.status(403).build();
            applicationRepository.delete(app);
            return ResponseEntity.ok(Map.of("message", "Deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
