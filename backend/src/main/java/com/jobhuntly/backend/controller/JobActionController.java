package com.jobhuntly.backend.controller;

import com.jobhuntly.backend.dto.ReportJobRequest;
import com.jobhuntly.backend.dto.SaveJobRequest;
import com.jobhuntly.backend.entity.JobAction;
import com.jobhuntly.backend.service.JobActionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/job-actions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class JobActionController {
    
    @Autowired
    private JobActionService jobActionService;
    
    // Save Job endpoints
    @PostMapping("/save")
    public ResponseEntity<?> saveJob(@Valid @RequestBody SaveJobRequest request, Authentication authentication) {
        try {
            String email = authentication.getName();
            Map<String, Object> response = jobActionService.saveJob(email, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/save/{jobId}")
    public ResponseEntity<?> unsaveJob(@PathVariable Long jobId, Authentication authentication) {
        try {
            String email = authentication.getName();
            Map<String, Object> response = jobActionService.unsaveJob(email, jobId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/saved")
    public ResponseEntity<?> getSavedJobs(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<JobAction> savedJobs = jobActionService.getSavedJobs(email);
            return ResponseEntity.ok(savedJobs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/saved/{jobId}")
    public ResponseEntity<?> isJobSaved(@PathVariable Long jobId, Authentication authentication) {
        try {
            String email = authentication.getName();
            boolean isSaved = jobActionService.isJobSaved(email, jobId);
            Map<String, Object> response = new HashMap<>();
            response.put("isSaved", isSaved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Report Job endpoints
    @PostMapping("/report")
    public ResponseEntity<?> reportJob(@Valid @RequestBody ReportJobRequest request, Authentication authentication) {
        try {
            String email = authentication.getName();
            Map<String, Object> response = jobActionService.reportJob(email, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/reports")
    public ResponseEntity<?> getUserReports(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<JobAction> reports = jobActionService.getUserReports(email);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Reading List endpoints
    @PostMapping("/reading-list/{jobId}")
    public ResponseEntity<?> addToReadingList(@PathVariable Long jobId, Authentication authentication) {
        try {
            String email = authentication.getName();
            Map<String, Object> response = jobActionService.addToReadingList(email, jobId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/reading-list/{jobId}")
    public ResponseEntity<?> removeFromReadingList(@PathVariable Long jobId, Authentication authentication) {
        try {
            String email = authentication.getName();
            Map<String, Object> response = jobActionService.removeFromReadingList(email, jobId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/reading-list")
    public ResponseEntity<?> getReadingList(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<JobAction> readingList = jobActionService.getReadingList(email);
            return ResponseEntity.ok(readingList);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/reading-list/unread")
    public ResponseEntity<?> getUnreadItems(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<JobAction> unreadItems = jobActionService.getReadingList(email); // Use same method for now
            return ResponseEntity.ok(unreadItems);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/reading-list/{jobId}")
    public ResponseEntity<?> isInReadingList(@PathVariable Long jobId, Authentication authentication) {
        try {
            String email = authentication.getName();
            boolean inList = jobActionService.isInReadingList(email, jobId);
            Map<String, Object> response = new HashMap<>();
            response.put("inReadingList", inList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // New unified endpoints
    @PostMapping("/share/{jobId}")
    public ResponseEntity<?> shareJob(@PathVariable Long jobId, @RequestBody Map<String, String> request, Authentication authentication) {
        try {
            String email = authentication.getName();
            String shareMethod = request.getOrDefault("shareMethod", "unknown");
            Map<String, Object> response = jobActionService.shareJob(email, jobId, shareMethod);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<?> getAllUserActions(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<JobAction> actions = jobActionService.getAllUserActions(email);
            return ResponseEntity.ok(actions);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/shared")
    public ResponseEntity<?> getSharedJobs(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<JobAction> sharedJobs = jobActionService.getSharedJobs(email);
            return ResponseEntity.ok(sharedJobs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}