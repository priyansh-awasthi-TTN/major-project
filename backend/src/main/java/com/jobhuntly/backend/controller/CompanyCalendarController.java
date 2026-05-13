package com.jobhuntly.backend.controller;

import com.jobhuntly.backend.dto.CalendarCategoryDTO;
import com.jobhuntly.backend.dto.CalendarCategoryRequest;
import com.jobhuntly.backend.dto.CalendarEventDTO;
import com.jobhuntly.backend.dto.CalendarEventRequest;
import com.jobhuntly.backend.dto.CalendarResponse;
import com.jobhuntly.backend.service.CompanyCalendarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/company/calendar")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:3000", "http://127.0.0.1:3000"})
public class CompanyCalendarController {

    private final CompanyCalendarService companyCalendarService;

    @Autowired
    public CompanyCalendarController(CompanyCalendarService companyCalendarService) {
        this.companyCalendarService = companyCalendarService;
    }

    @GetMapping
    public ResponseEntity<CalendarResponse> getCalendar(
            Authentication authentication,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(companyCalendarService.getCalendar(authentication.getName(), startDate, endDate));
    }

    @PostMapping("/categories")
    public ResponseEntity<CalendarCategoryDTO> createCategory(
            Authentication authentication,
            @RequestBody CalendarCategoryRequest request
    ) {
        return ResponseEntity.ok(companyCalendarService.createCategory(authentication.getName(), request));
    }

    @PutMapping("/categories/{categoryId}")
    public ResponseEntity<CalendarCategoryDTO> updateCategory(
            Authentication authentication,
            @PathVariable Long categoryId,
            @RequestBody CalendarCategoryRequest request
    ) {
        return ResponseEntity.ok(companyCalendarService.updateCategory(authentication.getName(), categoryId, request));
    }

    @PostMapping("/events")
    public ResponseEntity<CalendarEventDTO> createEvent(
            Authentication authentication,
            @RequestBody CalendarEventRequest request
    ) {
        return ResponseEntity.ok(companyCalendarService.createEvent(authentication.getName(), request));
    }

    @PutMapping("/events/{eventId}")
    public ResponseEntity<CalendarEventDTO> updateEvent(
            Authentication authentication,
            @PathVariable Long eventId,
            @RequestBody CalendarEventRequest request
    ) {
        return ResponseEntity.ok(companyCalendarService.updateEvent(authentication.getName(), eventId, request));
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<Map<String, String>> deleteEvent(
            Authentication authentication,
            @PathVariable Long eventId
    ) {
        companyCalendarService.deleteEvent(authentication.getName(), eventId);
        return ResponseEntity.ok(Map.of("message", "Event deleted"));
    }

    @PostMapping("/create-meet-link")
    public ResponseEntity<Map<String, String>> createGoogleMeetLink(
            Authentication authentication,
            @RequestBody Map<String, Object> eventDetails
    ) {
        String meetLink = companyCalendarService.createGoogleMeetLink(authentication.getName(), eventDetails);
        return ResponseEntity.ok(Map.of("meetLink", meetLink));
    }
}
