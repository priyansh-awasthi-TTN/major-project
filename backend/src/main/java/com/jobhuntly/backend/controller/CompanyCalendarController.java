package com.jobhuntly.backend.controller;

import com.jobhuntly.backend.dto.CalendarCategoryDTO;
import com.jobhuntly.backend.dto.CalendarCategoryRequest;
import com.jobhuntly.backend.dto.CalendarEventDTO;
import com.jobhuntly.backend.dto.CalendarEventRequest;
import com.jobhuntly.backend.dto.CalendarResponse;
import com.jobhuntly.backend.service.CompanyCalendarService;
import com.jobhuntly.backend.service.GoogleCalendarService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/company/calendar")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:3000", "http://127.0.0.1:3000"})
public class CompanyCalendarController {

    private final CompanyCalendarService companyCalendarService;
    private final GoogleCalendarService googleCalendarService;

    @Autowired
    public CompanyCalendarController(
            CompanyCalendarService companyCalendarService,
            GoogleCalendarService googleCalendarService
    ) {
        this.companyCalendarService = companyCalendarService;
        this.googleCalendarService = googleCalendarService;
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

    @GetMapping("/google/authorize")
    public ResponseEntity<Map<String, String>> authorizeGoogleCalendar(Authentication authentication) {
        String redirectUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/company/calendar/google/callback")
                .toUriString();
        String authUrl = googleCalendarService.getAuthorizationUrl(authentication.getName(), redirectUri);
        return ResponseEntity.ok(Map.of("authUrl", authUrl));
    }

    @GetMapping(value = "/google/callback", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> handleGoogleCalendarCallback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            HttpServletRequest request
    ) {
        if (error != null && !error.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_HTML)
                    .body(buildPopupPage(false, "Google Calendar connection failed",
                            "Google returned: " + error + "."));
        }

        if (code == null || code.isBlank() || state == null || state.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_HTML)
                    .body(buildPopupPage(false, "Google Calendar connection failed",
                            "Missing authorization code or state."));
        }

        String redirectUri = ServletUriComponentsBuilder.fromRequestUri(request)
                .replaceQuery(null)
                .build()
                .toUriString();

        try {
            googleCalendarService.handleAuthorizationCallback(code, state, redirectUri);
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(buildPopupPage(true, "Google Calendar connected",
                            "You can close this window and continue creating the event."));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_HTML)
                    .body(buildPopupPage(false, "Google Calendar connection failed", ex.getMessage()));
        }
    }

    private String buildPopupPage(boolean success, String title, String message) {
        String escapedTitle = escapeHtml(title);
        String escapedMessage = escapeHtml(message);
        return """
                <!doctype html>
                <html lang="en">
                <head>
                  <meta charset="utf-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <title>%s</title>
                  <style>
                    body { font-family: Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; }
                    main { max-width: 480px; margin: 10vh auto; padding: 24px; background: white; border-radius: 12px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12); }
                    h1 { font-size: 20px; margin: 0 0 12px; }
                    p { margin: 0; line-height: 1.5; }
                  </style>
                </head>
                <body>
                  <main>
                    <h1>%s</h1>
                    <p>%s</p>
                  </main>
                  <script>
                    if (window.opener) {
                      window.opener.postMessage({ type: 'jobhuntly-google-calendar', success: %s, message: %s }, '*');
                    }
                    setTimeout(function () { window.close(); }, 600);
                  </script>
                </body>
                </html>
                """.formatted(
                escapedTitle,
                escapedTitle,
                escapedMessage,
                success ? "true" : "false",
                toJavascriptString(message));
    }

    private String escapeHtml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    private String toJavascriptString(String value) {
        return "\"" + value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "") + "\"";
    }
}
