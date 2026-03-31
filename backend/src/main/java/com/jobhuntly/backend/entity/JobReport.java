package com.jobhuntly.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_reports")
public class JobReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false)
    private ReportReason reason;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "reported_at", nullable = false)
    private LocalDateTime reportedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReportStatus status;
    
    public enum ReportReason {
        SPAM, INAPPROPRIATE_CONTENT, FAKE_JOB, MISLEADING_INFO, DISCRIMINATION, OTHER
    }
    
    public enum ReportStatus {
        PENDING, REVIEWED, RESOLVED, DISMISSED
    }
    
    // Constructors
    public JobReport() {
        this.reportedAt = LocalDateTime.now();
        this.status = ReportStatus.PENDING;
    }
    
    public JobReport(User user, Job job, ReportReason reason, String description) {
        this();
        this.user = user;
        this.job = job;
        this.reason = reason;
        this.description = description;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
    
    public ReportReason getReason() { return reason; }
    public void setReason(ReportReason reason) { this.reason = reason; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getReportedAt() { return reportedAt; }
    public void setReportedAt(LocalDateTime reportedAt) { this.reportedAt = reportedAt; }
    
    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus status) { this.status = status; }
}