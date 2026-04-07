package com.jobhuntly.backend.dto;

import java.util.List;

public class ProfileEducationDTO {
    private Long id;
    private String school;
    private String logo;
    private String logoBg;
    private String degree;
    private String start;
    private String end;
    private String desc;
    
    // New fields
    private Boolean notifyNetwork;
    private String fieldOfStudy;
    private String startMonth;
    private String startYear;
    private String endMonth;
    private String endYear;
    private String grade;
    private String activities;
    private List<String> skills;
    private List<MediaFileDTO> media;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSchool() {
        return school;
    }

    public void setSchool(String school) {
        this.school = school;
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

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
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

    public String getFieldOfStudy() {
        return fieldOfStudy;
    }

    public void setFieldOfStudy(String fieldOfStudy) {
        this.fieldOfStudy = fieldOfStudy;
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

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getActivities() {
        return activities;
    }

    public void setActivities(String activities) {
        this.activities = activities;
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
