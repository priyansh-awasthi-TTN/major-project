package com.jobhuntly.backend.dto;

import java.util.List;

public class ProfileExperienceDTO {
    private Long id;
    private String role;
    private String company;
    private String logo;
    private String logoBg;
    private String type;
    private String start;
    private String end;
    private String duration;
    private String location;
    private String desc;
    
    // New fields for enhanced experience
    private Boolean notifyNetwork;
    private Boolean currentlyWorking;
    private Boolean endCurrentPosition;
    private String startMonth;
    private String startYear;
    private String endMonth;
    private String endYear;
    private String locationType;
    private String headline;
    private String jobSource;
    private List<String> skills;
    private List<MediaFileDTO> media;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public String getLogoBg() {
        return logoBg;
    }

    public void setLogoBg(String logoBg) {
        this.logoBg = logoBg;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStart() {
        return start;
    }

    public void setStart(String start) {
        this.start = start;
    }

    public String getEnd() {
        return end;
    }

    public void setEnd(String end) {
        this.end = end;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public Boolean getNotifyNetwork() {
        return notifyNetwork;
    }

    public void setNotifyNetwork(Boolean notifyNetwork) {
        this.notifyNetwork = notifyNetwork;
    }

    public Boolean getCurrentlyWorking() {
        return currentlyWorking;
    }

    public void setCurrentlyWorking(Boolean currentlyWorking) {
        this.currentlyWorking = currentlyWorking;
    }

    public Boolean getEndCurrentPosition() {
        return endCurrentPosition;
    }

    public void setEndCurrentPosition(Boolean endCurrentPosition) {
        this.endCurrentPosition = endCurrentPosition;
    }

    public String getStartMonth() {
        return startMonth;
    }

    public void setStartMonth(String startMonth) {
        this.startMonth = startMonth;
    }

    public String getStartYear() {
        return startYear;
    }

    public void setStartYear(String startYear) {
        this.startYear = startYear;
    }

    public String getEndMonth() {
        return endMonth;
    }

    public void setEndMonth(String endMonth) {
        this.endMonth = endMonth;
    }

    public String getEndYear() {
        return endYear;
    }

    public void setEndYear(String endYear) {
        this.endYear = endYear;
    }

    public String getLocationType() {
        return locationType;
    }

    public void setLocationType(String locationType) {
        this.locationType = locationType;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getJobSource() {
        return jobSource;
    }

    public void setJobSource(String jobSource) {
        this.jobSource = jobSource;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public List<MediaFileDTO> getMedia() {
        return media;
    }

    public void setMedia(List<MediaFileDTO> media) {
        this.media = media;
    }
}
