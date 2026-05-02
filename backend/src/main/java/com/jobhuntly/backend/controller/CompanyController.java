package com.jobhuntly.backend.controller;

import com.jobhuntly.backend.entity.Application;
import com.jobhuntly.backend.entity.Job;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.repository.ApplicationRepository;
import com.jobhuntly.backend.repository.JobRepository;
import com.jobhuntly.backend.repository.UserRepository;
import com.jobhuntly.backend.service.JwtService;
import com.jobhuntly.backend.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/company/applications")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class CompanyController {

    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private JobRepository jobRepository;
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
                result.add(m);
            }
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

            if (!job.getPostedByUserId().equals(companyUser.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Not your job applicant"));
            }

            app.setStatus(body.get("status"));
            applicationRepository.save(app);

            return ResponseEntity.ok(Map.of("message", "Status updated successfully", "status", app.getStatus()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
