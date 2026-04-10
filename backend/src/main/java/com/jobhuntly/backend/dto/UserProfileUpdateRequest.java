package com.jobhuntly.backend.dto;

import java.util.List;

public class UserProfileUpdateRequest {
    private String fullName;
    private String email;
    private String title;
    private String company;
    private String location;
    private String about;
    private String phone;
    private String dateOfBirth;
    private String gender;
    private String userType;
    private String languages;
    private String instagram;
    private String twitter;
    private String website;
    private String industry;
    private String companySize;
    private String profilePhotoUrl;
    private String coverPhotoUrl;
    private Boolean openToOpportunities;
    private List<String> skills;
    private List<ProfileExperienceDTO> experiences;
    private List<ProfileEducationDTO> educations;

    // Edit intro modal fields
    private String firstName;
    private String lastName;
    private String additionalName;
    private String pronouns;
    private String pronounsVisibility;
    private String currentPosition;
    private Boolean showCurrentCompany;
    private String school;
    private Boolean showSchool;
    private String country;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAbout() {
        return about;
    }

    public void setAbout(String about) {
        this.about = about;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public String getLanguages() {
        return languages;
    }

    public void setLanguages(String languages) {
        this.languages = languages;
    }

    public String getInstagram() {
        return instagram;
    }

    public void setInstagram(String instagram) {
        this.instagram = instagram;
    }

    public String getTwitter() {
        return twitter;
    }

    public void setTwitter(String twitter) {
        this.twitter = twitter;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getCompanySize() {
        return companySize;
    }

    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getCoverPhotoUrl() {
        return coverPhotoUrl;
    }

    public void setCoverPhotoUrl(String coverPhotoUrl) {
        this.coverPhotoUrl = coverPhotoUrl;
    }

    public Boolean getOpenToOpportunities() {
        return openToOpportunities;
    }

    public void setOpenToOpportunities(Boolean openToOpportunities) {
        this.openToOpportunities = openToOpportunities;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public List<ProfileExperienceDTO> getExperiences() {
        return experiences;
    }

    public void setExperiences(List<ProfileExperienceDTO> experiences) {
        this.experiences = experiences;
    }

    public List<ProfileEducationDTO> getEducations() {
        return educations;
    }

    public void setEducations(List<ProfileEducationDTO> educations) {
        this.educations = educations;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getAdditionalName() {
        return additionalName;
    }

    public void setAdditionalName(String additionalName) {
        this.additionalName = additionalName;
    }

    public String getPronouns() {
        return pronouns;
    }

    public void setPronouns(String pronouns) {
        this.pronouns = pronouns;
    }

    public String getPronounsVisibility() {
        return pronounsVisibility;
    }

    public void setPronounsVisibility(String pronounsVisibility) {
        this.pronounsVisibility = pronounsVisibility;
    }

    public String getCurrentPosition() {
        return currentPosition;
    }

    public void setCurrentPosition(String currentPosition) {
        this.currentPosition = currentPosition;
    }

    public Boolean getShowCurrentCompany() {
        return showCurrentCompany;
    }

    public void setShowCurrentCompany(Boolean showCurrentCompany) {
        this.showCurrentCompany = showCurrentCompany;
    }

    public String getSchool() {
        return school;
    }

    public void setSchool(String school) {
        this.school = school;
    }

    public Boolean getShowSchool() {
        return showSchool;
    }

    public void setShowSchool(Boolean showSchool) {
        this.showSchool = showSchool;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }
}
