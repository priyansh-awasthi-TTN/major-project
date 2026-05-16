package com.jobhuntly.backend.controller;

import com.jobhuntly.backend.entity.Application;
import com.jobhuntly.backend.entity.Job;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.entity.Notification;
import com.jobhuntly.backend.repository.ApplicationRepository;
import com.jobhuntly.backend.repository.JobRepository;
import com.jobhuntly.backend.repository.NotificationRepository;
import com.jobhuntly.backend.repository.UserRepository;
import com.jobhuntly.backend.service.JwtService;
import com.jobhuntly.backend.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/company/applications")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:3000", "http://127.0.0.1:3000"})
public class CompanyController {

    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private JobRepository jobRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtService jwtService;
    @Autowired private TokenService tokenService;

    private Map<String, Object> toJobMap(Job job, User user) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", job.getId());
        result.put("title", job.getTitle());
        result.put("company", user != null ? user.getFullName() : job.getCompany());
        
        if (user != null && user.getProfilePhotoUrl() != null) {
            result.put("logo", user.getProfilePhotoUrl());
        } else if (user != null && user.getFullName() != null && user.getFullName().length() >= 2) {
            result.put("logo", user.getFullName().substring(0, 2).toUpperCase());
        } else {
            result.put("logo", job.getLogo());
        }
        
        result.put("color", job.getColor());
        result.put("location", job.getLocation());
        result.put("type", job.getType());
        result.put("categories", job.getCategories() != null ? Arrays.stream(job.getCategories().split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .toList() : List.of());
        result.put("level", job.getLevel());
        result.put("salary", job.getSalary());
        result.put("applied", job.getApplied() != null ? job.getApplied() : 0);
        result.put("capacity", job.getCapacity() != null ? job.getCapacity() : 0);
        result.put("description", job.getDescription());
        result.put("postedByCompany", user != null ? user.getFullName() : job.getPostedByCompany());
        result.put("postedByUserId", job.getPostedByUserId());
        result.put("createdAt", job.getCreatedAt() != null ? job.getCreatedAt().toString() : null);
        result.put("status", "Live");
        
        if (user != null) {
            result.put("companyDescription", user.getDescription());
            result.put("companySize", user.getCompanySize());
            result.put("companyIndustry", user.getIndustry());
            result.put("companyWebsite", user.getWebsite());
        }
        
        return result;
    }

    private User resolveUser(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) throw new RuntimeException("Unauthorized");
        String token = header.substring(7);
        if (!tokenService.isAccessTokenValid(token)) throw new RuntimeException("Invalid token");
        String email = jwtService.extractUsername(token);
        return userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<?> getCompanyApplications(HttpServletRequest request) {
        try {
            User companyUser = resolveUser(request);
            if (companyUser.getUserType() != User.UserType.COMPANY) {
                return ResponseEntity.status(403).body(Map.of("message", "Only companies can access this"));
            }

            // Find all jobs posted by this company
            List<Job> myJobs = jobRepository.findByPostedByUserId(companyUser.getId());
            List<Long> jobIds = myJobs.stream().map(Job::getId).collect(Collectors.toList());

            if (jobIds.isEmpty()) return ResponseEntity.ok(List.of());

            List<Application> apps = applicationRepository.findByJobIdInOrderByDateAppliedDesc(jobIds);

            List<Map<String, Object>> result = new ArrayList<>();
            for (Application a : apps) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", a.getId());
                m.put("jobId", a.getJobId());
                m.put("title", a.getTitle());
                m.put("candidateId", a.getUser().getId());
                m.put("candidateName", a.getUser().getFullName());
                m.put("candidateEmail", a.getUser().getEmail());
                m.put("dateApplied", a.getDateApplied() != null ? a.getDateApplied().toString() : null);
                m.put("status", a.getStatus());
                m.put("score", a.getScore() != null ? a.getScore() : 0.0);
                m.put("resumeUrl", a.getResumeUrl());
                m.put("coverLetter", a.getCoverLetter());
                m.put("packageCtc", a.getPackageCtc());
                m.put("gratuity", a.getGratuity());
                m.put("assessmentDocumentUrl", a.getAssessmentDocumentUrl());
                m.put("assessmentDescription", a.getAssessmentDescription());
                m.put("interviewDate", a.getInterviewDate() != null ? a.getInterviewDate().toString() : null);
                m.put("meetLink", a.getMeetLink());
                result.add(m);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/jobs")
    public ResponseEntity<?> getCompanyJobs(HttpServletRequest request) {
        try {
            User companyUser = resolveUser(request);
            if (companyUser.getUserType() != User.UserType.COMPANY) {
                return ResponseEntity.status(403).body(Map.of("message", "Only companies can access this"));
            }

            List<Job> jobs = jobRepository.findByPostedByUserIdOrderByCreatedAtDesc(companyUser.getId());
            List<Map<String, Object>> result = jobs.stream()
                    .map(job -> toJobMap(job, companyUser))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateApplicantStatus(@PathVariable Long id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        try {
            User companyUser = resolveUser(request);
            if (companyUser.getUserType() != User.UserType.COMPANY) {
                return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
            }

            Application app = applicationRepository.findById(id).orElseThrow(() -> new RuntimeException("Application not found"));
            Job job = jobRepository.findById(app.getJobId()).orElseThrow(() -> new RuntimeException("Job not found"));

            if (job.getPostedByUserId() == null || !job.getPostedByUserId().equals(companyUser.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Not your job applicant"));
            }

            String nextStatus = body.get("status");
            app.setStatus(nextStatus);
            if (body.containsKey("packageCtc")) app.setPackageCtc(body.get("packageCtc"));
            if (body.containsKey("gratuity")) app.setGratuity(body.get("gratuity"));
            if (body.containsKey("assessmentDocumentUrl")) app.setAssessmentDocumentUrl(body.get("assessmentDocumentUrl"));
            if (body.containsKey("assessmentDescription")) app.setAssessmentDescription(body.get("assessmentDescription"));
            if (body.containsKey("interviewDate") && body.get("interviewDate") != null) {
                app.setInterviewDate(LocalDateTime.parse(body.get("interviewDate")));
            }
            if (body.containsKey("meetLink")) app.setMeetLink(body.get("meetLink"));
            applicationRepository.save(app);

            Notification candidateNotification = new Notification();
            candidateNotification.setRecipient(app.getUser());
            candidateNotification.setActorUserId(companyUser.getId());
            candidateNotification.setActorName(job.getCompany());
            candidateNotification.setCategory("applications");
            candidateNotification.setType("status");
            
            String candidateMsg = "updated your application status for " + job.getTitle() + " to " + nextStatus;
            if ("Interviewing".equals(nextStatus) && app.getInterviewDate() != null) {
                candidateMsg += ". Your interview is scheduled for " + app.getInterviewDate().toString().replace("T", " ");
            }
            candidateNotification.setText(candidateMsg);
            
            candidateNotification.setBadge(nextStatus);
            candidateNotification.setBadgeColor("border border-indigo-400 text-indigo-600");

            Notification companyNotification = new Notification();
            companyNotification.setRecipient(companyUser);
            companyNotification.setActorUserId(companyUser.getId());
            
            String compName = companyUser.getCurrentCompany() != null ? companyUser.getCurrentCompany() : companyUser.getFullName();
            companyNotification.setActorName(compName);
            companyNotification.setCategory("applications");
            companyNotification.setType("status");
            companyNotification.setText("moved applicant " + app.getUser().getFullName() + " to " + nextStatus + " for " + job.getTitle());
            companyNotification.setBadge(nextStatus);
            companyNotification.setBadgeColor("border border-indigo-400 text-indigo-600");

            notificationRepository.saveAll(List.of(candidateNotification, companyNotification));

            return ResponseEntity.ok(Map.of("message", "Status updated successfully", "status", app.getStatus()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
