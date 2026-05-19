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
import com.jobhuntly.backend.repository.NotificationRepository;
import com.jobhuntly.backend.service.ChatService;
import com.jobhuntly.backend.entity.Notification;
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
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private ChatService chatService;

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
        
        String companyName = a.getCompany();
        String logo = a.getLogo();

        if (a.getJobId() != null) {
            jobRepository.findById(a.getJobId()).ifPresent(job -> {
                if (job.getPostedByUserId() != null) {
                    userRepository.findById(job.getPostedByUserId()).ifPresent(user -> {
                        m.put("company", user.getFullName());
                        m.put("companyUserId", user.getId());
                        m.put("companyEmail", user.getEmail());
                        m.put("companyRecruiterName", user.getRecruiterName());
                        m.put("companyUserType", user.getUserType() != null ? user.getUserType().name() : null);
                        if (user.getProfilePhotoUrl() != null) {
                            m.put("logo", user.getProfilePhotoUrl());
                        } else if (user.getFullName() != null && user.getFullName().length() >= 2) {
                            m.put("logo", user.getFullName().substring(0, 2).toUpperCase());
                        }
                    });
                }
            });
        }
        
        m.putIfAbsent("company", companyName);
        m.putIfAbsent("logo", logo != null ? logo : (m.get("company").toString().length() >= 2 ? m.get("company").toString().substring(0, 2).toUpperCase() : ""));
        
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
        m.put("packageCtc", a.getPackageCtc());
        m.put("gratuity", a.getGratuity());
        m.put("assessmentDocumentUrl", a.getAssessmentDocumentUrl());
        m.put("assessmentDescription", a.getAssessmentDescription());
        m.put("interviewDate", a.getInterviewDate() != null ? a.getInterviewDate().toString() : null);
        m.put("meetLink", a.getMeetLink());
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

    // POST /api/applications/{id}/follow-up
    @PostMapping("/{id}/follow-up")
    public ResponseEntity<?> requestFollowUp(@PathVariable Long id, HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            Application app = applicationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            if (!app.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
            }

            Job job = jobRepository.findById(app.getJobId())
                    .orElseThrow(() -> new RuntimeException("Job not found"));

            if (job.getPostedByUserId() != null) {
                User companyUser = userRepository.findById(job.getPostedByUserId()).orElse(null);
                if (companyUser != null) {
                    // Create Notification for the company
                    Notification notification = new Notification();
                    notification.setRecipient(companyUser);
                    notification.setActorUserId(user.getId());
                    notification.setActorName(user.getFullName());
                    notification.setCategory("Application");
                    notification.setType("FOLLOW_UP");
                    notification.setText(user.getFullName() + " requested a follow-up for their application to " + job.getTitle() + ".");
                    notification.setBadge("Application");
                    notification.setBadgeColor("bg-yellow-500");
                    notificationRepository.save(notification);

                    // Send Automated Chat Message from company to user after 2 minutes
                    String autoReply = "Hi " + user.getFullName() + ", we have received your follow-up request for the " + job.getTitle() + " position. Our team is currently reviewing applications and will get back to you shortly.";
                    new Thread(() -> {
                        try {
                            Thread.sleep(120000); // 2 minutes delay
                            chatService.sendMessage(companyUser.getEmail(), user.getId(), autoReply, "TEXT", null);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                    }).start();
                }
            }

            return ResponseEntity.ok(Map.of("message", "Follow-up requested successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // POST /api/applications/{id}/submit-assessment
    @PostMapping("/{id}/submit-assessment")
    public ResponseEntity<?> submitAssessment(@PathVariable Long id, HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            Application app = applicationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            if (!app.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
            }

            Job job = jobRepository.findById(app.getJobId())
                    .orElseThrow(() -> new RuntimeException("Job not found"));

            if (job.getPostedByUserId() != null) {
                User companyUser = userRepository.findById(job.getPostedByUserId()).orElse(null);
                if (companyUser != null) {
                    Notification notification = new Notification();
                    notification.setRecipient(companyUser);
                    notification.setActorUserId(user.getId());
                    notification.setActorName(user.getFullName());
                    notification.setCategory("Application");
                    notification.setType("ASSESSMENT_SUBMITTED");
                    notification.setText(user.getFullName() + " has submitted the assessment for " + job.getTitle() + ".");
                    notification.setBadge("Assessment");
                    notification.setBadgeColor("bg-blue-500");
                    notificationRepository.save(notification);
                }
            }

            return ResponseEntity.ok(Map.of("message", "Assessment submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // POST /api/applications/{id}/reschedule-request
    @PostMapping("/{id}/reschedule-request")
    public ResponseEntity<?> requestReschedule(@PathVariable Long id, HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            Application app = applicationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            if (!app.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
            }

            Job job = jobRepository.findById(app.getJobId())
                    .orElseThrow(() -> new RuntimeException("Job not found"));

            User companyUser = null;
            if (job.getPostedByUserId() != null) {
                companyUser = userRepository.findById(job.getPostedByUserId()).orElse(null);
            }

            if (companyUser == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Company user not found"));
            }

            Notification notification = new Notification();
            notification.setRecipient(companyUser);
            notification.setActorUserId(user.getId());
            notification.setActorName(user.getFullName());
            notification.setCategory("applications");
            notification.setType("RESCHEDULE_REQUEST");

            String interviewDate = app.getInterviewDate() != null ? app.getInterviewDate().toString().replace("T", " ") : "unspecified";
            String text = user.getFullName() + " requested to reschedule the interview for " + job.getTitle() + ". Current time: " + interviewDate + ".";
            notification.setText(text);
            notification.setBadge("Reschedule");
            notification.setBadgeColor("border border-orange-400 text-orange-600");
            notificationRepository.save(notification);

            String companyName = companyUser.getCurrentCompany() != null ? companyUser.getCurrentCompany() : companyUser.getFullName();
            String recruiterName = companyUser.getRecruiterName();

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("message", "Reschedule request sent successfully");
            response.put("companyEmail", companyUser.getEmail());
            response.put("companyName", companyName);
            response.put("recruiterName", recruiterName);
            response.put("jobTitle", job.getTitle());
            response.put("interviewDate", app.getInterviewDate() != null ? app.getInterviewDate().toString() : null);
            response.put("meetLink", app.getMeetLink());
            response.put("applicantName", user.getFullName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ApplicationRequest req, HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            if (req.getJobId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Job id is required."));
            }

            Job job = jobRepository.findById(req.getJobId())
                    .orElseThrow(() -> new RuntimeException("Job not found"));

            if (job.getPostedByUserId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only company-posted jobs can accept applications."));
            }

            if (applicationRepository.existsByUserAndJobId(user, job.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "You have already applied for this job."));
            }
            Application app = new Application();
            app.setUser(user);
            app.setJobId(job.getId());
            app.setCompany(job.getCompany());
            app.setLogo(job.getLogo());
            app.setColor(job.getColor());
            app.setLocation(job.getLocation());
            app.setTitle(job.getTitle());
            app.setType(job.getType());
            app.setDateApplied(req.getDateApplied() != null ? req.getDateApplied() : LocalDate.now());
            app.setStatus(req.getStatus() != null ? req.getStatus() : "In Review");
            app.setSalary(job.getSalary() != null ? String.valueOf(job.getSalary()) : req.getSalary());
            app.setNote(req.getNote());
            app.setResumeUrl(req.getResumeUrl());
            app.setCoverLetter(req.getCoverLetter());
            Application saved = applicationRepository.save(app);

            // Increment applied count on the job
            job.setApplied((job.getApplied() != null ? job.getApplied() : 0) + 1);
            jobRepository.save(job);

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
            String nextStatus = body.get("status");
            if ("Hired".equalsIgnoreCase(app.getStatus()) && nextStatus != null && !"Hired".equalsIgnoreCase(nextStatus)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Hired applications cannot be changed to another status."));
            }
            app.setStatus(nextStatus);
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
