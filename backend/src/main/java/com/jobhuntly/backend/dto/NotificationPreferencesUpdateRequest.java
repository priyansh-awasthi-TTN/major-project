package com.jobhuntly.backend.dto;

public class NotificationPreferencesUpdateRequest {
    private Boolean applicationNotifications;
    private Boolean jobNotifications;
    private Boolean recommendationNotifications;

    public Boolean getApplicationNotifications() {
        return applicationNotifications;
    }

    public void setApplicationNotifications(Boolean applicationNotifications) {
        this.applicationNotifications = applicationNotifications;
    }

    public Boolean getJobNotifications() {
        return jobNotifications;
    }

    public void setJobNotifications(Boolean jobNotifications) {
        this.jobNotifications = jobNotifications;
    }

    public Boolean getRecommendationNotifications() {
        return recommendationNotifications;
    }

    public void setRecommendationNotifications(Boolean recommendationNotifications) {
        this.recommendationNotifications = recommendationNotifications;
    }
}
