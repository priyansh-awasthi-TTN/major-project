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
    private SavedJobRepository savedJobRepository;
    
    @Autowired
    private JobReportRepository jobReportRepository;
    
    @Autowired
    private ReadingListRepository readingListRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JobRepository jobRepository;
    
    // Save Job functionality
    @Transactional
    public Map<String, Object> saveJob(String userEmail, SaveJobRequest request) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Job job = jobRepository.findById(request.getJobId())
            .orElseThrow(() -> new RuntimeException("Job not found"));
        
        Map<String, Object> response = new HashMap<>();
        
        if (savedJobRepository.existsByUserAndJob(user, job)) {
            response.put("success", false);
            response.put("message", "Job is already saved");
            response.put("alreadySaved", true);
            return response;
        }
        
        SavedJob savedJob = new SavedJob(user, job);
        savedJob.setNotes(request.getNotes());
        savedJobRepository.save(savedJob);
        
        response.put("success", true);
        response.put("message", "Job saved successfully");
        response.put("savedJobId", savedJob.getId());
        return response;
    }
    
    @Transactional
    public Map<String, Object> unsaveJob(String userEmail, Long jobId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        
        Map<String, Object> response = new HashMap<>();
        
        if (!savedJobRepository.existsByUserAndJob(user, job)) {
            response.put("success", false);
            response.put("message", "Job is not saved");
            return response;
        }
        
        savedJobRepository.deleteByUserAndJob(user, job);
        
        response.put("success", true);
        response.put("message", "Job removed from saved jobs");
        return response;
    }
    
    public List<SavedJob> getSavedJobs(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return savedJobRepository.findByUserOrderBySavedAtDesc(user);
    }
    
    public boolean isJobSaved(String userEmail, Long jobId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        
        return savedJobRepository.existsByUserAndJob(user, job);
    }
    
    // Report Job functionality
    @Transactional
    public Map<String, Object> reportJob(String userEmail, ReportJobRequest request) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Job job = jobRepository.findById(request.getJobId())
            .orElseThrow(() -> new RuntimeException("Job not found"));
        
        Map<String, Object> response = new HashMap<>();
        
        if (jobReportRepository.existsByUserAndJob(user, job)) {
            response.put("success", false);
            response.put("message", "You have already reported this job");
            response.put("alreadyReported", true);
            return response;
        }
        
        JobReport report = new JobReport(user, job, request.getReason(), request.getDescription());
        jobReportRepository.save(report);
        
        response.put("success", true);
        response.put("message", "Job reported successfully. We will review it shortly.");
        response.put("reportId", report.getId());
        return response;
    }
    
    public List<JobReport> getUserReports(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return jobReportRepository.findByUserOrderByReportedAtDesc(user);
    }
    
    // Reading List functionality
    @Transactional
    public Map<String, Object> addToReadingList(String userEmail, Long jobId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        
        Map<String, Object> response = new HashMap<>();
        
        if (readingListRepository.existsByUserAndJob(user, job)) {
            response.put("success", false);
            response.put("message", "Job is already in your reading list");
            response.put("alreadyInList", true);
            return response;
        }
        
        ReadingListItem item = new ReadingListItem(user, job);
        readingListRepository.save(item);
        
        response.put("success", true);
        response.put("message", "Job added to reading list");
        response.put("readingListId", item.getId());
        return response;
    }
    
    @Transactional
    public Map<String, Object> removeFromReadingList(String userEmail, Long jobId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        
        Map<String, Object> response = new HashMap<>();
        
        if (!readingListRepository.existsByUserAndJob(user, job)) {
            response.put("success", false);
            response.put("message", "Job is not in your reading list");
            return response;
        }
        
        readingListRepository.deleteByUserAndJob(user, job);
        
        response.put("success", true);
        response.put("message", "Job removed from reading list");
        return response;
    }
    
    @Transactional
    public Map<String, Object> markAsRead(String userEmail, Long jobId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        
        ReadingListItem item = readingListRepository.findByUserAndJob(user, job)
            .orElseThrow(() -> new RuntimeException("Job not found in reading list"));
        
        item.setIsRead(true);
        readingListRepository.save(item);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Job marked as read");
        return response;
    }
    
    public List<ReadingListItem> getReadingList(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return readingListRepository.findByUserOrderByAddedAtDesc(user);
    }
    
    public List<ReadingListItem> getUnreadItems(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return readingListRepository.findByUserAndIsReadOrderByAddedAtDesc(user, false);
    }
    
    public boolean isInReadingList(String userEmail, Long jobId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        
        return readingListRepository.existsByUserAndJob(user, job);
    }
}