package com.jobhuntly.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobhuntly.backend.dto.ReportJobRequest;
import com.jobhuntly.backend.dto.SaveJobRequest;
import com.jobhuntly.backend.entity.JobAction;
import com.jobhuntly.backend.entity.Job;
import com.jobhuntly.backend.service.JobActionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/job-actions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class JobActionController {
    
    @Autowired
    private JobActionService jobActionService;

    @Autowired
    private ObjectMapper objectMapper;

    private Map<String, Object> toJobResponse(Job job) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", job.getId());
        response.put("title", job.getTitle());
        response.put("company", job.getCompany());
        response.put("logo", job.getLogo());
        response.put("color", job.getColor());
        response.put("location", job.getLocation());
        response.put("type", job.getType());
        response.put("categories", job.getCategories());
        response.put("level", job.getLevel());
        response.put("salary", job.getSalary());
        response.put("applied", job.getApplied());
        response.put("capacity", job.getCapacity());
        response.put("description", job.getDescription());
        response.put("postedByCompany", job.getPostedByCompany());
        response.put("createdAt", job.getCreatedAt());
        return response;
    }

    private Map<String, Object> parseMetadata(String metadata) {
        if (metadata == null || metadata.isBlank()) {
            return Map.of();
        }

        try {
            return objectMapper.readValue(metadata, new TypeReference<Map<String, Object>>() {});
        } catch (Exception ignored) {
            return Map.of("value", metadata);
        }
    }

    private Map<String, Object> toActionResponse(JobAction action) {
        Map<String, Object> metadata = parseMetadata(action.getMetadata());
        Map<String, Object> response = new LinkedHashMap<>();

        response.put("id", action.getId());
        response.put("actionType", action.getActionType().name());
        response.put("createdAt", action.getCreatedAt());
        response.put("updatedAt", action.getUpdatedAt());
        response.put("job", toJobResponse(action.getJob()));
        response.put("metadata", metadata);

        switch (action.getActionType()) {
            case SAVE -> response.put("notes", metadata.getOrDefault("notes", metadata.getOrDefault("value", "")));
            case READ_LATER -> {
                response.put("addedAt", action.getCreatedAt());
                response.put("isRead", metadata.getOrDefault("isRead", false));
            }
            case REPORT -> {
                response.put("reason", metadata.getOrDefault("reason", "OTHER"));
                response.put("description", metadata.getOrDefault("description", ""));
                response.put("reportedAt", action.getCreatedAt());
            }
            case SHARE -> response.put("shareMethod", metadata.getOrDefault("shareMethod", "unknown"));
        }

        return response;
    }

    private List<Map<String, Object>> toActionResponses(List<JobAction> actions) {
        return actions.stream().map(this::toActionResponse).collect(Collectors.toList());
    }
    
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
            return ResponseEntity.ok(toActionResponses(savedJobs));
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
            return ResponseEntity.ok(toActionResponses(reports));
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
            return ResponseEntity.ok(toActionResponses(readingList));
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
            return ResponseEntity.ok(toActionResponses(unreadItems));
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
            return ResponseEntity.ok(toActionResponses(actions));
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
            return ResponseEntity.ok(toActionResponses(sharedJobs));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
