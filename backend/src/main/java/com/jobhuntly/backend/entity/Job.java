package com.jobhuntly.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    @Column
    private String logo;

    @Column
    private String color;

    @Column
    private String location;

    @Column
    private String type;

    @Column
    private String categories;

    @Column
    private String level;

    @Column
    private Integer salary;

    @Column
    private Integer applied;

    @Column
    private Integer capacity;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "posted_by_user_id")
    private Long postedByUserId;

    @Column(name = "posted_by_company")
    private String postedByCompany;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() { this.createdAt = LocalDateTime.now(); }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getCategories() { return categories; }
    public void setCategories(String categories) { this.categories = categories; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public Integer getSalary() { return salary; }
    public void setSalary(Integer salary) { this.salary = salary; }
    public Integer getApplied() { return applied; }
    public void setApplied(Integer applied) { this.applied = applied; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getPostedByUserId() { return postedByUserId; }
    public void setPostedByUserId(Long postedByUserId) { this.postedByUserId = postedByUserId; }
    public String getPostedByCompany() { return postedByCompany; }
    public void setPostedByCompany(String postedByCompany) { this.postedByCompany = postedByCompany; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
