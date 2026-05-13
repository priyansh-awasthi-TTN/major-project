package com.jobhuntly.backend.dto;

public class CalendarCategoryDTO {
    private Long id;
    private String name;
    private String color;
    private Boolean visible;
    private Boolean defaultCategory;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Boolean getVisible() {
        return visible;
    }

    public void setVisible(Boolean visible) {
        this.visible = visible;
    }

    public Boolean getDefaultCategory() {
        return defaultCategory;
    }

    public void setDefaultCategory(Boolean defaultCategory) {
        this.defaultCategory = defaultCategory;
    }
}
