package com.jobhuntly.backend.service;

import com.jobhuntly.backend.dto.ReportJobRequest;
import com.jobhuntly.backend.dto.SaveJobRequest;
import com.jobhuntly.backend.entity.*;
import com.jobhuntly.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class JobActionService {
    
    @Autowired
    private JobActionRepository jobActionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JobRepository jobRepository;
    
    // Unified Job Action functionality
    @Transactional
    public Map<String, Object> performJobAction(String userEmail, Long jobId, JobAction.ActionType actionType, String metadata) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        
        Map<String, Object> response = new HashMap<>();
        
        // Check if action already exists
        if (jobActionRepository.existsByUserAndJobAndActionType(user, job, actionType)) {
            response.put("success", false);
            response.put("message", getAlreadyExistsMessage(actionType));
            response.put("alreadyExists", true);
            return response;
        }
        
        // Create new action
        JobAction jobAction = new JobAction(user, job, actionType, metadata);
        jobActionRepository.save(jobAction);
        
        response.put("success", true);
        response.put("message", getSuccessMessage(actionType));
        response.put("actionId", jobAction.getId());
        return response;
    }
    
    @Transactional
    public Map<String, Object> removeJobAction(String userEmail, Long jobId, JobAction.ActionType actionType) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        
        Map<String, Object> response = new HashMap<>();
        
        if (!jobActionRepository.existsByUserAndJobAndActionType(user, job, actionType)) {
            response.put("success", false);
            response.put("message", getNotExistsMessage(actionType));
            return response;
        }
        
        jobActionRepository.deleteByUserAndJobAndActionType(user, job, actionType);
        
        response.put("success", true);
        response.put("message", getRemoveSuccessMessage(actionType));
        return response;
    }
    
    // Legacy methods for backward compatibility
    @Transactional
    public Map<String, Object> saveJob(String userEmail, SaveJobRequest request) {
        return performJobAction(userEmail, request.getJobId(), JobAction.ActionType.SAVE, request.getNotes());
    }
    
    @Transactional
    public Map<String, Object> unsaveJob(String userEmail, Long jobId) {
        return removeJobAction(userEmail, jobId, JobAction.ActionType.SAVE);
    }
    
    @Transactional
    public Map<String, Object> reportJob(String userEmail, ReportJobRequest request) {
        String metadata = String.format("{\"reason\":\"%s\",\"description\":\"%s\"}", 
                                      request.getReason(), request.getDescription());
        return performJobAction(userEmail, request.getJobId(), JobAction.ActionType.REPORT, metadata);
    }
    
    @Transactional
    public Map<String, Object> addToReadingList(String userEmail, Long jobId) {
        return performJobAction(userEmail, jobId, JobAction.ActionType.READ_LATER, null);
    }
    
    @Transactional
    public Map<String, Object> removeFromReadingList(String userEmail, Long jobId) {
        return removeJobAction(userEmail, jobId, JobAction.ActionType.READ_LATER);
    }
    
    @Transactional
    public Map<String, Object> shareJob(String userEmail, Long jobId, String shareMethod) {
        String metadata = String.format("{\"shareMethod\":\"%s\"}", shareMethod);
        return performJobAction(userEmail, jobId, JobAction.ActionType.SHARE, metadata);
    }
    
    // Get actions by type
    public List<JobAction> getSavedJobs(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return jobActionRepository.findSavedJobsByUser(user);
    }
    
    public List<JobAction> getReadingList(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return jobActionRepository.findReadingListByUser(user);
    }
    
    public List<JobAction> getUserReports(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return jobActionRepository.findReportedJobsByUser(user);
    }
    
    public List<JobAction> getSharedJobs(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return jobActionRepository.findSharedJobsByUser(user);
    }
    
    public List<JobAction> getAllUserActions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return jobActionRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    // Check if action exists
    public boolean isJobSaved(String userEmail, Long jobId) {
        return hasJobAction(userEmail, jobId, JobAction.ActionType.SAVE);
    }
    
    public boolean isInReadingList(String userEmail, Long jobId) {
        return hasJobAction(userEmail, jobId, JobAction.ActionType.READ_LATER);
    }
    
    public boolean hasJobAction(String userEmail, Long jobId, JobAction.ActionType actionType) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        
        return jobActionRepository.existsByUserAndJobAndActionType(user, job, actionType);
    }
    
    // Helper methods for messages
    private String getAlreadyExistsMessage(JobAction.ActionType actionType) {
        return switch (actionType) {
            case SAVE -> "Job is already saved";
            case SHARE -> "Job has already been shared";
            case REPORT -> "You have already reported this job";
            case READ_LATER -> "Job is already in your reading list";
        };
    }
    
    private String getSuccessMessage(JobAction.ActionType actionType) {
        return switch (actionType) {
            case SAVE -> "Job saved successfully";
            case SHARE -> "Job shared successfully";
            case REPORT -> "Job reported successfully. We will review it shortly.";
            case READ_LATER -> "Job added to reading list";
        };
    }
    
    private String getNotExistsMessage(JobAction.ActionType actionType) {
        return switch (actionType) {
            case SAVE -> "Job is not saved";
            case SHARE -> "Job was not shared";
            case REPORT -> "Job was not reported";
            case READ_LATER -> "Job is not in your reading list";
        };
    }
    
    private String getRemoveSuccessMessage(JobAction.ActionType actionType) {
        return switch (actionType) {
            case SAVE -> "Job removed from saved jobs";
            case SHARE -> "Share action removed";
            case REPORT -> "Report removed";
            case READ_LATER -> "Job removed from reading list";
        };
    }
}