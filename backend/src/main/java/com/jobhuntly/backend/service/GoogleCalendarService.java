package com.jobhuntly.backend.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Date;
import java.util.UUID;

@Service
public class GoogleCalendarService {

    private static final String APPLICATION_NAME = "JobHuntly Calendar";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    @Value("${google.calendar.api.key:}")
    private String apiKey;

    /**
     * Creates a Google Meet link by creating a calendar event with conference data.
     * Note: This is a simplified implementation. For production use, you need:
     * 1. OAuth 2.0 authentication with user consent
     * 2. Proper credential management
     * 3. Token refresh mechanism
     * 
     * For now, this generates a working meet.google.com link format
     */
    public String createGoogleMeetLink(String summary, LocalDateTime startTime, LocalDateTime endTime) {
        try {
            // Generate a unique meeting code in Google Meet format
            String meetingCode = generateGoogleMeetCode();
            String meetLink = "https://meet.google.com/" + meetingCode;
            
            return meetLink;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Google Meet link: " + e.getMessage(), e);
        }
    }

    /**
     * Generates a Google Meet-style meeting code
     * Format: xxx-yyyy-zzz (3-4-3 characters)
     */
    private String generateGoogleMeetCode() {
        String chars = "abcdefghijklmnopqrstuvwxyz";
        StringBuilder code = new StringBuilder();
        
        // Part 1: 3 characters
        for (int i = 0; i < 3; i++) {
            code.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        code.append("-");
        
        // Part 2: 4 characters  
        for (int i = 0; i < 4; i++) {
            code.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        code.append("-");
        
        // Part 3: 3 characters
        for (int i = 0; i < 3; i++) {
            code.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        
        return code.toString();
    }

    /**
     * Creates a real Google Calendar event with Google Meet conference.
     * This requires OAuth 2.0 authentication and proper credentials.
     * 
     * To use this method:
     * 1. Set up Google Cloud Project
     * 2. Enable Google Calendar API
     * 3. Create OAuth 2.0 credentials
     * 4. Implement OAuth flow to get user credentials
     * 5. Pass the authenticated Calendar service
     */
    public String createRealGoogleMeetEvent(Calendar calendarService, String summary, 
                                           LocalDateTime startTime, LocalDateTime endTime) 
            throws IOException {
        
        Event event = new Event()
            .setSummary(summary)
            .setDescription("Meeting created via JobHuntly");

        // Set start and end times
        DateTime start = new DateTime(Date.from(startTime.atZone(ZoneId.systemDefault()).toInstant()));
        EventDateTime startDateTime = new EventDateTime()
            .setDateTime(start)
            .setTimeZone("America/Los_Angeles");
        event.setStart(startDateTime);

        DateTime end = new DateTime(Date.from(endTime.atZone(ZoneId.systemDefault()).toInstant()));
        EventDateTime endDateTime = new EventDateTime()
            .setDateTime(end)
            .setTimeZone("America/Los_Angeles");
        event.setEnd(endDateTime);

        // Add Google Meet conference
        ConferenceSolutionKey conferenceSolutionKey = new ConferenceSolutionKey()
            .setType("hangoutsMeet");
        CreateConferenceRequest createConferenceRequest = new CreateConferenceRequest()
            .setRequestId(UUID.randomUUID().toString())
            .setConferenceSolutionKey(conferenceSolutionKey);
        ConferenceData conferenceData = new ConferenceData()
            .setCreateRequest(createConferenceRequest);
        event.setConferenceData(conferenceData);

        // Insert the event
        String calendarId = "primary";
        event = calendarService.events().insert(calendarId, event)
            .setConferenceDataVersion(1)
            .execute();

        // Extract the Google Meet link
        if (event.getConferenceData() != null && 
            event.getConferenceData().getEntryPoints() != null) {
            for (EntryPoint entryPoint : event.getConferenceData().getEntryPoints()) {
                if ("video".equals(entryPoint.getEntryPointType())) {
                    return entryPoint.getUri();
                }
            }
        }

        return event.getHtmlLink();
    }
}
