package com.jobhuntly.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class JobResponseDTO {
    private Long id;
    private String title;
    private String company;
    private String description;
    private String responsibilities;
    private String salary;
    private String location;
    private String type;
    private List<String> skillsRequired;
    private String companyDescription;
    private String companyWebsite;
    private String companySize;
    private String companyIndustry;
    private LocalDateTime postedAt;
    private LocalDateTime deadline;
    private boolean hasUserApplied;
    
    // Constructors
    public JobResponseDTO() {}
    
    public JobResponseDTO(Long id, String title, String company, String description, 
                         String responsibilities, String salary, String location, String type,
                         List<String> skillsRequired, String companyDescription, String companyWebsite,
                         String companySize, String companyIndustry, LocalDateTime postedAt, 
                         LocalDateTime deadline, boolean hasUserApplied) {
        this.id = id;
        this.title = title;
        this.company = company;
        this.description = description;
        this.responsibilities = responsibilities;
        this.salary = salary;
        this.location = location;
        this.type = type;
        this.skillsRequired = skillsRequired;
        this.companyDescription = companyDescription;
        this.companyWebsite = companyWebsite;
        this.companySize = companySize;
        this.companyIndustry = companyIndustry;
        this.postedAt = postedAt;
        this.deadline = deadline;
        this.hasUserApplied = hasUserApplied;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getResponsibilities() { return responsibilities; }
    public void setResponsibilities(String responsibilities) { this.responsibilities = responsibilities; }
    
    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public List<String> getSkillsRequired() { return skillsRequired; }
    public void setSkillsRequired(List<String> skillsRequired) { this.skillsRequired = skillsRequired; }
    
    public String getCompanyDescription() { return companyDescription; }
    public void setCompanyDescription(String companyDescription) { this.companyDescription = companyDescription; }
    
    public String getCompanyWebsite() { return companyWebsite; }
    public void setCompanyWebsite(String companyWebsite) { this.companyWebsite = companyWebsite; }
    
    public String getCompanySize() { return companySize; }
    public void setCompanySize(String companySize) { this.companySize = companySize; }
    
    public String getCompanyIndustry() { return companyIndustry; }
    public void setCompanyIndustry(String companyIndustry) { this.companyIndustry = companyIndustry; }
    
    public LocalDateTime getPostedAt() { return postedAt; }
    public void setPostedAt(LocalDateTime postedAt) { this.postedAt = postedAt; }
    
    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
    
    public boolean isHasUserApplied() { return hasUserApplied; }
    public void setHasUserApplied(boolean hasUserApplied) { this.hasUserApplied = hasUserApplied; }
}