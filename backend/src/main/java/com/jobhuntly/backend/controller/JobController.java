package com.jobhuntly.backend.controller;

import com.jobhuntly.backend.entity.Job;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.repository.JobRepository;
import com.jobhuntly.backend.repository.UserRepository;
import com.jobhuntly.backend.service.JwtService;
import com.jobhuntly.backend.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000" })
public class JobController {

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
            return null;
        String token = header.substring(7);
        if (!tokenService.isAccessTokenValid(token))
            return null;
        String email = jwtService.extractUsername(token);
        return userRepository.findByEmailAndIsActiveTrue(email).orElse(null);
    }

    private Map<String, Object> toMap(Job j, User user) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", j.getId());
        m.put("title", j.getTitle());
        m.put("company", user != null ? user.getFullName() : j.getCompany());
        
        if (user != null && user.getProfilePhotoUrl() != null) {
            m.put("logo", user.getProfilePhotoUrl());
        } else if (user != null && user.getFullName() != null && user.getFullName().length() >= 2) {
            m.put("logo", user.getFullName().substring(0, 2).toUpperCase());
        } else {
            m.put("logo", j.getLogo());
        }
        
        m.put("color", j.getColor());
        m.put("location", j.getLocation());
        m.put("type", j.getType());
        m.put("categories", j.getCategories() != null
                ? Arrays.asList(j.getCategories().split(","))
                : List.of());
        m.put("level", j.getLevel());
        m.put("salary", j.getSalary());
        m.put("applied", j.getApplied() != null ? j.getApplied() : 0);
        m.put("capacity", j.getCapacity());
        m.put("description", j.getDescription());
        m.put("postedByCompany", user != null ? user.getFullName() : j.getPostedByCompany());
        m.put("postedByUserId", j.getPostedByUserId());
        m.put("createdAt", j.getCreatedAt());
        m.put("isNew", j.getCreatedAt() != null && j.getCreatedAt().isAfter(LocalDateTime.now().minusDays(7)));
        
        if (user != null) {
            m.put("companyDescription", user.getDescription());
            m.put("companySize", user.getCompanySize());
            m.put("companyIndustry", user.getIndustry());
            m.put("companyWebsite", user.getWebsite());
            m.put("companyLocation", user.getLocation());
            m.put("companyTwitter", user.getTwitterUrl());
            m.put("companyInstagram", user.getInstagramUrl());
        }
        
        return m;
    }

    // GET all jobs — public
    @GetMapping("/jobs")
    public ResponseEntity<?> getAll() {
        List<Map<String, Object>> result = new ArrayList<>();
        Map<Long, User> userCache = new HashMap<>();
        for (Job j : jobRepository.findAllByOrderByCreatedAtDesc()) {
            if (j.getPostedByUserId() != null && !userCache.containsKey(j.getPostedByUserId())) {
                userRepository.findById(j.getPostedByUserId()).ifPresent(u -> userCache.put(u.getId(), u));
            }
            result.add(toMap(j, userCache.get(j.getPostedByUserId())));
        }
        return ResponseEntity.ok(result);
    }

    // GET single job — public
    @GetMapping("/jobs/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return jobRepository.findById(id)
                .map(j -> {
                    User u = j.getPostedByUserId() != null ? userRepository.findById(j.getPostedByUserId()).orElse(null) : null;
                    return ResponseEntity.ok(toMap(j, u));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // POST — company creates a job (requires auth)
    @PostMapping("/jobs")
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            if (user == null)
                return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

            Job job = new Job();
            job.setTitle((String) body.get("title"));
            job.setCompany(user.getFullName()); // company name from user profile
            job.setLogo(body.containsKey("logo") ? (String) body.get("logo")
                    : user.getFullName().substring(0, Math.min(2, user.getFullName().length())).toUpperCase());
            job.setColor(body.containsKey("color") ? (String) body.get("color") : "bg-blue-600");
            job.setLocation((String) body.get("location"));
            job.setType((String) body.get("type"));
            job.setCategories((String) body.get("categories"));
            job.setLevel((String) body.get("level"));
            if (body.get("salary") != null)
                job.setSalary(Integer.parseInt(body.get("salary").toString()));
            job.setCapacity(null);
            job.setApplied(0);
            job.setDescription((String) body.get("description"));
            job.setPostedByUserId(user.getId());
            job.setPostedByCompany(user.getFullName());

            Job saved = jobRepository.save(job);
            return ResponseEntity.ok(toMap(saved, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // DELETE — company deletes own job
    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpServletRequest request) {
        try {
            User user = resolveUser(request);
            if (user == null)
                return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
            Job job = jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
            if (!job.getPostedByUserId().equals(user.getId()))
                return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
            jobRepository.delete(job);
            return ResponseEntity.ok(Map.of("message", "Deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // GET companies with location filtering
    @GetMapping("/companies")
    public ResponseEntity<?> getCompanies(@RequestParam(required = false) String location) {
        try {
            List<User> companies;
            if (location != null && !location.trim().isEmpty()) {
                // Filter by location (case-insensitive partial match)
                companies = userRepository.findByUserTypeAndLocationContainingIgnoreCase(User.UserType.COMPANY,
                        location.trim());
            } else {
                // Get all companies
                companies = userRepository.findByUserType(User.UserType.COMPANY);
            }

            List<Map<String, Object>> result = new ArrayList<>();
            for (User company : companies) {
                Map<String, Object> companyData = new LinkedHashMap<>();
                companyData.put("id", company.getId());
                companyData.put("name", company.getFullName());
                companyData.put("email", company.getEmail());
                companyData.put("location", company.getLocation());
                companyData.put("description", company.getDescription());
                companyData.put("website", company.getWebsite());
                companyData.put("industry", company.getIndustry());
                companyData.put("companySize", company.getCompanySize());

                // Count jobs posted by this company
                long jobCount = jobRepository.countByPostedByUserId(company.getId());
                companyData.put("jobCount", jobCount);

                result.add(companyData);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
