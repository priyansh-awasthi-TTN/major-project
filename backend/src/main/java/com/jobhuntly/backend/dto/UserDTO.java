package com.jobhuntly.backend.dto;

public class UserDTO {
    private Long id;
    private String fullName;
    private String email;
    private String userType;
    private String location;
    private String description;
    private String website;
    private String industry;
    private String companySize;
    
    public UserDTO() {}

    public UserDTO(Long id, String fullName, String email) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
    }

    public UserDTO(
            Long id,
            String fullName,
            String email,
            String userType,
            String location,
            String description,
            String website,
            String industry,
            String companySize
    ) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.userType = userType;
        this.location = location;
        this.description = description;
        this.website = website;
        this.industry = industry;
        this.companySize = companySize;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public String getCompanySize() { return companySize; }
    public void setCompanySize(String companySize) { this.companySize = companySize; }
}
