package com.jobhuntly.backend.dto;

import com.jobhuntly.backend.entity.JobReport;
import jakarta.validation.constraints.NotNull;

public class ReportJobRequest {
    
    @NotNull(message = "Job ID is required")
    private Long jobId;
    
    @NotNull(message = "Reason is required")
    private JobReport.ReportReason reason;
    
    private String description;
    
    // Constructors
    public ReportJobRequest() {}
    
    public ReportJobRequest(Long jobId, JobReport.ReportReason reason, String description) {
        this.jobId = jobId;
        this.reason = reason;
        this.description = description;
    }
    
    // Getters and Setters
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    
    public JobReport.ReportReason getReason() { return reason; }
    public void setReason(JobReport.ReportReason reason) { this.reason = reason; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}