package com.jobhuntly.backend.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.*;
import com.google.api.services.calendar.CalendarScopes;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
import java.util.UUID;

@Service
public class GoogleCalendarService {

    private static final String APPLICATION_NAME = "JobHuntly Calendar";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    @Value("${google.calendar.enabled:false}")
    private boolean meetEnabled;

    @Value("${google.calendar.credentials-path:}")
    private String credentialsPath;

    @Value("${google.calendar.credentials-json:}")
    private String credentialsJson;

    @Value("${google.calendar.calendar-id:primary}")
    private String calendarId;

    @Value("${google.calendar.timezone:UTC}")
    private String timeZone;

    @Value("${google.calendar.impersonated-user:}")
    private String impersonatedUser;

    private final ResourceLoader resourceLoader;

    public GoogleCalendarService(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    /**
     * Creates a Google Meet link by creating a calendar event with conference data.
     * Requires service-account or OAuth credentials configured in google.calendar.*.
     */
    public String createGoogleMeetLink(String summary, LocalDateTime startTime, LocalDateTime endTime) {
        if (!meetEnabled) {
            throw new IllegalStateException("Google Meet integration is disabled. Configure google.calendar.* settings.");
        }

        try {
            Calendar calendarService = buildCalendarService();
            return createRealGoogleMeetEvent(calendarService, summary, startTime, endTime);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Google Meet link: " + e.getMessage(), e);
        }
    }

    private Calendar buildCalendarService() throws IOException, GeneralSecurityException {
        NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        Credential credential = loadCredential();

        return new Calendar.Builder(httpTransport, JSON_FACTORY, credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    private Credential loadCredential() throws IOException {
        InputStream inputStream = resolveCredentialsStream();
        if (inputStream == null) {
            throw new IllegalStateException("Google Calendar credentials not found. Set google.calendar.credentials-path or google.calendar.credentials-json.");
        }

        GoogleCredential baseCredential = GoogleCredential.fromStream(inputStream)
                .createScoped(Collections.singleton(CalendarScopes.CALENDAR));

        if (impersonatedUser != null && !impersonatedUser.isBlank()) {
            baseCredential = new GoogleCredential.Builder()
                    .setTransport(baseCredential.getTransport())
                    .setJsonFactory(baseCredential.getJsonFactory())
                    .setServiceAccountId(baseCredential.getServiceAccountId())
                    .setServiceAccountPrivateKey(baseCredential.getServiceAccountPrivateKey())
                    .setServiceAccountScopes(baseCredential.getServiceAccountScopes())
                    .setServiceAccountUser(impersonatedUser)
                    .build();
        }

        return baseCredential;
    }

    private InputStream resolveCredentialsStream() throws IOException {
        if (credentialsJson != null && !credentialsJson.isBlank()) {
            return new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8));
        }

        if (credentialsPath != null && !credentialsPath.isBlank()) {
            Resource resource = resourceLoader.getResource(credentialsPath);
            if (resource.exists()) {
                return resource.getInputStream();
            }
        }

        return null;
    }

    /**
     * Creates a real Google Calendar event with Google Meet conference.
     */
    public String createRealGoogleMeetEvent(Calendar calendarService, String summary,
                                           LocalDateTime startTime, LocalDateTime endTime)
            throws IOException {

        Event event = new Event()
                .setSummary(summary)
                .setDescription("Meeting created via JobHuntly");

        DateTime start = new DateTime(Date.from(startTime.atZone(ZoneId.of(timeZone)).toInstant()));
        EventDateTime startDateTime = new EventDateTime()
                .setDateTime(start)
                .setTimeZone(timeZone);
        event.setStart(startDateTime);

        DateTime end = new DateTime(Date.from(endTime.atZone(ZoneId.of(timeZone)).toInstant()));
        EventDateTime endDateTime = new EventDateTime()
                .setDateTime(end)
                .setTimeZone(timeZone);
        event.setEnd(endDateTime);

        ConferenceSolutionKey conferenceSolutionKey = new ConferenceSolutionKey()
                .setType("hangoutsMeet");
        CreateConferenceRequest createConferenceRequest = new CreateConferenceRequest()
                .setRequestId(UUID.randomUUID().toString())
                .setConferenceSolutionKey(conferenceSolutionKey);
        ConferenceData conferenceData = new ConferenceData()
                .setCreateRequest(createConferenceRequest);
        event.setConferenceData(conferenceData);

        event = calendarService.events().insert(calendarId, event)
                .setConferenceDataVersion(1)
                .execute();

        if (event.getConferenceData() != null && event.getConferenceData().getEntryPoints() != null) {
            for (EntryPoint entryPoint : event.getConferenceData().getEntryPoints()) {
                if ("video".equals(entryPoint.getEntryPointType())) {
                    return entryPoint.getUri();
                }
            }
        }

        if (event.getHangoutLink() != null) {
            return event.getHangoutLink();
        }

        return event.getHtmlLink();
    }
}
