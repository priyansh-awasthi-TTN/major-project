package com.jobhuntly.backend.dto;

import java.time.LocalDate;

public class ApplicationRequest {
    private Long jobId;
    private String company;
    private String logo;
    private String color;
    private String location;
    private String title;
    private String type;
    private LocalDate dateApplied;
    private String status;
    private String salary;
    private String note;
    private String resumeUrl;
    private String coverLetter;

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public LocalDate getDateApplied() { return dateApplied; }
    public void setDateApplied(LocalDate dateApplied) { this.dateApplied = dateApplied; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
}
