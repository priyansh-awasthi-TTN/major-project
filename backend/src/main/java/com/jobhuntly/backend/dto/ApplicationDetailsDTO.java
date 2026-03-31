package com.jobhuntly.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ApplicationDetailsDTO {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String jobLocation;
    private String status; // PENDING, ACCEPTED, REJECTED, INTERVIEW
    private LocalDateTime appliedDate;
    private String resumeUrl;
    private String coverLetter;
    private List<RecruiterMessageDTO> recruiterMessages;
    private InterviewScheduleDTO interviewSchedule;
    private String notes;
    
    // Constructors
    public ApplicationDetailsDTO() {}
    
    public ApplicationDetailsDTO(Long id, Long jobId, String jobTitle, String companyName, 
                               String jobLocation, String status, LocalDateTime appliedDate, 
                               String resumeUrl, String coverLetter, List<RecruiterMessageDTO> recruiterMessages,
                               InterviewScheduleDTO interviewSchedule, String notes) {
        this.id = id;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.jobLocation = jobLocation;
        this.status = status;
        this.appliedDate = appliedDate;
        this.resumeUrl = resumeUrl;
        this.coverLetter = coverLetter;
        this.recruiterMessages = recruiterMessages;
        this.interviewSchedule = interviewSchedule;
        this.notes = notes;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    
    public String getJobLocation() { return jobLocation; }
    public void setJobLocation(String jobLocation) { this.jobLocation = jobLocation; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDateTime appliedDate) { this.appliedDate = appliedDate; }
    
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    
    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    
    public List<RecruiterMessageDTO> getRecruiterMessages() { return recruiterMessages; }
    public void setRecruiterMessages(List<RecruiterMessageDTO> recruiterMessages) { this.recruiterMessages = recruiterMessages; }
    
    public InterviewScheduleDTO getInterviewSchedule() { return interviewSchedule; }
    public void setInterviewSchedule(InterviewScheduleDTO interviewSchedule) { this.interviewSchedule = interviewSchedule; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    // Nested DTOs
    public static class RecruiterMessageDTO {
        private Long id;
        private String senderName;
        private String content;
        private LocalDateTime timestamp;
        private boolean isRead;
        
        public RecruiterMessageDTO() {}
        
        public RecruiterMessageDTO(Long id, String senderName, String content, LocalDateTime timestamp, boolean isRead) {
            this.id = id;
            this.senderName = senderName;
            this.content = content;
            this.timestamp = timestamp;
            this.isRead = isRead;
        }
        
        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }
        
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        
        public boolean isRead() { return isRead; }
        public void setRead(boolean read) { isRead = read; }
    }
    
    public static class InterviewScheduleDTO {
        private Long id;
        private LocalDateTime date;
        private String time;
        private String location;
        private String meetingLink;
        private String notes;
        
        public InterviewScheduleDTO() {}
        
        public InterviewScheduleDTO(Long id, LocalDateTime date, String time, 
                                  String location, String meetingLink, String notes) {
            this.id = id;
            this.date = date;
            this.time = time;
            this.location = location;
            this.meetingLink = meetingLink;
            this.notes = notes;
        }
        
        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public LocalDateTime getDate() { return date; }
        public void setDate(LocalDateTime date) { this.date = date; }
        
        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        
        public String getMeetingLink() { return meetingLink; }
        public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}