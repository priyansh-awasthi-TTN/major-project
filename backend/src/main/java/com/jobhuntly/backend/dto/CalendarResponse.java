package com.jobhuntly.backend.dto;

import java.time.LocalDate;
import java.util.List;

public class CalendarResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private List<CalendarCategoryDTO> categories;
    private List<CalendarEventDTO> events;

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public List<CalendarCategoryDTO> getCategories() {
        return categories;
    }

    public void setCategories(List<CalendarCategoryDTO> categories) {
        this.categories = categories;
    }

    public List<CalendarEventDTO> getEvents() {
        return events;
    }

    public void setEvents(List<CalendarEventDTO> events) {
        this.events = events;
    }
}
