package com.jobhuntly.backend.dto;

import jakarta.validation.constraints.NotNull;

public class SaveJobRequest {
    
    @NotNull(message = "Job ID is required")
    private Long jobId;
    
    private String notes;
    
    // Constructors
    public SaveJobRequest() {}
    
    public SaveJobRequest(Long jobId, String notes) {
        this.jobId = jobId;
        this.notes = notes;
    }
    
    // Getters and Setters
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}