package com.jobhuntly.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.ConferenceData;
import com.google.api.services.calendar.model.CreateConferenceRequest;
import com.google.api.services.calendar.model.EntryPoint;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.model.EventAttendee;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.exception.GoogleCalendarAuthorizationRequiredException;
import com.jobhuntly.backend.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.ZoneId;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GoogleCalendarService {

    private static final String APPLICATION_NAME = "JobHuntly Calendar";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final String PRIMARY_CALENDAR_ID = "primary";
    private static final int CONFERENCE_POLL_ATTEMPTS = 5;
    private static final long CONFERENCE_POLL_DELAY_MS = 1_000L;
    private static final long AUTH_STATE_TTL_MINUTES = 10L;

    @Value("${google.calendar.enabled:false}")
    private boolean meetEnabled;

    @Value("${google.calendar.credentials-path:}")
    private String credentialsPath;

    @Value("${google.calendar.credentials-json:}")
    private String credentialsJson;

    @Value("${google.calendar.timezone:UTC}")
    private String timeZone;

    private final ResourceLoader resourceLoader;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, PendingAuthorization> pendingAuthorizations = new ConcurrentHashMap<>();

    public GoogleCalendarService(
            ResourceLoader resourceLoader,
            UserRepository userRepository,
            ObjectMapper objectMapper
    ) {
        this.resourceLoader = resourceLoader;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Creates a Google Meet link by creating a Google Calendar event on the
     * connected user's primary calendar.
     */
    @Transactional
    public String createGoogleMeetLink(User user, String summary, LocalDateTime startTime, LocalDateTime endTime) {
        if (!meetEnabled) {
            throw new IllegalStateException(
                    "Google Meet integration is disabled. Configure google.calendar.* settings.");
        }

        try {
            Calendar calendarService = buildCalendarService(user);
            return createRealGoogleMeetEvent(calendarService, summary, startTime, endTime);
        } catch (GoogleCalendarAuthorizationRequiredException ex) {
            throw ex;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Google Meet link: " + readableMessage(e), e);
        }
    }

    @Transactional
    public String createGoogleMeetLink(User user, String summary, LocalDateTime startTime, LocalDateTime endTime, List<String> attendees) {
        if (!meetEnabled) {
            throw new IllegalStateException(
                    "Google Meet integration is disabled. Configure google.calendar.* settings.");
        }

        try {
            Calendar calendarService = buildCalendarService(user);
            List<String> normalizedAttendees = attendees == null ? List.of() : attendees.stream()
                    .filter(value -> value != null && !value.isBlank())
                    .distinct()
                    .toList();
            return createRealGoogleMeetEvent(calendarService, summary, startTime, endTime, normalizedAttendees);
        } catch (GoogleCalendarAuthorizationRequiredException ex) {
            throw ex;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Google Meet link: " + readableMessage(e), e);
        }
    }

    public String getAuthorizationUrl(String appUserEmail, String redirectUri) {
        if (!meetEnabled) {
            throw new IllegalStateException(
                    "Google Meet integration is disabled. Configure google.calendar.* settings.");
        }

        try {
            GoogleClientSecrets.Details clientDetails = loadOauthClientDetails();
            NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                    httpTransport,
                    JSON_FACTORY,
                    clientDetails.getClientId(),
                    clientDetails.getClientSecret(),
                    List.of(CalendarScopes.CALENDAR))
                    .build();

            String state = createAuthorizationState(appUserEmail);
            return flow.newAuthorizationUrl()
                    .setRedirectUri(redirectUri)
                    .setState(state)
                    .set("access_type", "offline")
                    .set("include_granted_scopes", "true")
                    .set("prompt", "consent")
                    .build();
        } catch (IOException | GeneralSecurityException e) {
            throw new RuntimeException("Failed to prepare Google authorization: " + readableMessage(e), e);
        }
    }

    @Transactional
    public void handleAuthorizationCallback(String code, String state, String redirectUri) {
        PendingAuthorization pendingAuthorization = consumeAuthorizationState(state);

        try {
            GoogleClientSecrets.Details clientDetails = loadOauthClientDetails();
            NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            var tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                    httpTransport,
                    JSON_FACTORY,
                    clientDetails.getClientId(),
                    clientDetails.getClientSecret(),
                    code,
                    redirectUri
            ).execute();

            User user = userRepository.findByEmailAndIsActiveTrue(pendingAuthorization.userEmail())
                    .orElseThrow(() -> new IllegalStateException("User not found for Google Calendar authorization."));

            String refreshToken = tokenResponse.getRefreshToken();
            if (isBlank(refreshToken) && isBlank(user.getGoogleCalendarRefreshToken())) {
                throw new IllegalStateException(
                        "Google did not return a refresh token. Remove the app from your Google Account permissions and connect Google Calendar again.");
            }

            user.setGoogleCalendarAccessToken(tokenResponse.getAccessToken());
            if (!isBlank(refreshToken)) {
                user.setGoogleCalendarRefreshToken(refreshToken);
            }
            user.setGoogleCalendarTokenExpiresAt(toExpiryTime(tokenResponse.getExpiresInSeconds()));
            userRepository.save(user);
        } catch (IOException | GeneralSecurityException e) {
            throw new RuntimeException("Failed to complete Google authorization: " + readableMessage(e), e);
        }
    }

    private Calendar buildCalendarService(User user) throws IOException, GeneralSecurityException {
        NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        Credential credential = buildUserCredential(user, httpTransport);

        return new Calendar.Builder(httpTransport, JSON_FACTORY, credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    private Credential buildUserCredential(User user, NetHttpTransport httpTransport) throws IOException {
        GoogleClientSecrets.Details clientDetails = loadOauthClientDetails();

        if (isBlank(user.getGoogleCalendarAccessToken()) && isBlank(user.getGoogleCalendarRefreshToken())) {
            throw new GoogleCalendarAuthorizationRequiredException(
                    "Connect Google Calendar before adding a Meet link.");
        }

        GoogleCredential credential = new GoogleCredential.Builder()
                .setTransport(httpTransport)
                .setJsonFactory(JSON_FACTORY)
                .setClientSecrets(clientDetails.getClientId(), clientDetails.getClientSecret())
                .build()
                .setAccessToken(user.getGoogleCalendarAccessToken())
                .setRefreshToken(user.getGoogleCalendarRefreshToken());

        if (user.getGoogleCalendarTokenExpiresAt() != null) {
            long expirationTimeMs = user.getGoogleCalendarTokenExpiresAt()
                    .atOffset(ZoneOffset.UTC)
                    .toInstant()
                    .toEpochMilli();
            credential.setExpirationTimeMilliseconds(expirationTimeMs);
        }

        if (needsRefresh(user, credential)) {
            boolean refreshed = credential.refreshToken();
            if (!refreshed || isBlank(credential.getAccessToken())) {
                clearGoogleCalendarTokens(user);
                userRepository.save(user);
                throw new GoogleCalendarAuthorizationRequiredException(
                        "Reconnect Google Calendar before adding a Meet link.");
            }

            user.setGoogleCalendarAccessToken(credential.getAccessToken());
            user.setGoogleCalendarTokenExpiresAt(toExpiryTime(credential.getExpiresInSeconds()));
            if (!isBlank(credential.getRefreshToken())) {
                user.setGoogleCalendarRefreshToken(credential.getRefreshToken());
            }
            userRepository.save(user);
        }

        return credential;
    }

    private GoogleClientSecrets.Details loadOauthClientDetails() throws IOException {
        byte[] credentialBytes = resolveCredentialsBytes();
        if (credentialBytes == null) {
            throw new IllegalStateException(
                    "Google Calendar credentials not found. Set google.calendar.credentials-path or google.calendar.credentials-json.");
        }

        JsonNode rootNode = objectMapper.readTree(credentialBytes);
        if ("service_account".equals(rootNode.path("type").asText())) {
            throw new IllegalStateException(
                    "Google Meet requires OAuth client credentials. Replace google-credentials.json with an OAuth client credentials JSON from Google Cloud.");
        }

        if (!rootNode.has("web") && !rootNode.has("installed")) {
            throw new IllegalStateException(
                    "Unsupported Google credentials JSON. Use an OAuth client credentials JSON from Google Cloud.");
        }

        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(
                JSON_FACTORY,
                new InputStreamReader(new ByteArrayInputStream(credentialBytes), StandardCharsets.UTF_8));
        GoogleClientSecrets.Details clientDetails = clientSecrets.getWeb() != null
                ? clientSecrets.getWeb()
                : clientSecrets.getInstalled();

        if (clientDetails == null || isBlank(clientDetails.getClientId()) || isBlank(clientDetails.getClientSecret())) {
            throw new IllegalStateException(
                    "OAuth client credentials JSON is missing client_id or client_secret.");
        }

        return clientDetails;
    }

    private byte[] resolveCredentialsBytes() throws IOException {
        if (credentialsJson != null && !credentialsJson.isBlank()) {
            return credentialsJson.getBytes(StandardCharsets.UTF_8);
        }

        if (credentialsPath != null && !credentialsPath.isBlank()) {
            Resource resource = resourceLoader.getResource(credentialsPath);
            if (resource.exists()) {
                try (InputStream inputStream = resource.getInputStream()) {
                    return inputStream.readAllBytes();
                }
            }
        }

        return null;
    }

    private String createAuthorizationState(String userEmail) {
        purgeExpiredAuthorizations();
        String stateId = UUID.randomUUID().toString();
        pendingAuthorizations.put(stateId, new PendingAuthorization(
                userEmail,
                LocalDateTime.now(ZoneOffset.UTC).plusMinutes(AUTH_STATE_TTL_MINUTES)));
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(stateId.getBytes(StandardCharsets.UTF_8));
    }

    private PendingAuthorization consumeAuthorizationState(String encodedState) {
        purgeExpiredAuthorizations();

        final String decodedState;
        try {
            decodedState = new String(Base64.getUrlDecoder().decode(encodedState), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException("Google authorization state is invalid. Start the connection again.");
        }

        PendingAuthorization pendingAuthorization = pendingAuthorizations.remove(decodedState);
        if (pendingAuthorization == null
                || pendingAuthorization.expiresAt().isBefore(LocalDateTime.now(ZoneOffset.UTC))) {
            throw new IllegalStateException("Google authorization state is invalid or expired. Start the connection again.");
        }

        return pendingAuthorization;
    }

    private void purgeExpiredAuthorizations() {
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        pendingAuthorizations.entrySet().removeIf(entry -> entry.getValue().expiresAt().isBefore(now));
    }

    /**
     * Creates a real Google Calendar event with Google Meet conference.
     */
    public String createRealGoogleMeetEvent(Calendar calendarService, String summary,
            LocalDateTime startTime, LocalDateTime endTime)
            throws IOException, InterruptedException {
        return createRealGoogleMeetEvent(calendarService, summary, startTime, endTime, List.of());
    }

    public String createRealGoogleMeetEvent(Calendar calendarService, String summary,
            LocalDateTime startTime, LocalDateTime endTime, List<String> attendees)
            throws IOException, InterruptedException {

        Event event = new Event()
                .setSummary(summary)
                .setDescription("Meeting created via JobHuntly");

        if (attendees != null && !attendees.isEmpty()) {
            List<EventAttendee> eventAttendees = attendees.stream()
                    .map(email -> new EventAttendee().setEmail(email))
                    .toList();
            event.setAttendees(eventAttendees);
        }

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

        CreateConferenceRequest createConferenceRequest = new CreateConferenceRequest()
                .setRequestId(UUID.randomUUID().toString());
        ConferenceData conferenceData = new ConferenceData()
                .setCreateRequest(createConferenceRequest);
        event.setConferenceData(conferenceData);

        event = calendarService.events().insert(PRIMARY_CALENDAR_ID, event)
                .setConferenceDataVersion(1)
                .setSendUpdates(attendees != null && !attendees.isEmpty() ? "all" : "none")
                .execute();

        String meetLink = extractMeetLink(event);
        if (meetLink != null) {
            return meetLink;
        }

        for (int attempt = 0; attempt < CONFERENCE_POLL_ATTEMPTS; attempt++) {
            Thread.sleep(CONFERENCE_POLL_DELAY_MS);
            Event refreshedEvent = calendarService.events()
                    .get(PRIMARY_CALENDAR_ID, event.getId())
                    .execute();
            meetLink = extractMeetLink(refreshedEvent);
            if (meetLink != null) {
                return meetLink;
            }
        }

        if (!isBlank(event.getId())) {
            deleteEventQuietly(calendarService, event.getId());
        }

        throw new IllegalStateException(
                "Google Calendar created the event but did not attach a Google Meet conference. " +
                        "Use a Google account that can create Meet conferences on its primary calendar.");
    }

    private String extractMeetLink(Event event) {
        if (event.getConferenceData() != null && event.getConferenceData().getEntryPoints() != null) {
            for (EntryPoint entryPoint : event.getConferenceData().getEntryPoints()) {
                if ("video".equals(entryPoint.getEntryPointType()) && !isBlank(entryPoint.getUri())) {
                    return entryPoint.getUri();
                }
            }
        }

        if (!isBlank(event.getHangoutLink())) {
            return event.getHangoutLink();
        }

        return null;
    }

    private void deleteEventQuietly(Calendar calendarService, String eventId) {
        try {
            calendarService.events().delete(PRIMARY_CALENDAR_ID, eventId).execute();
        } catch (IOException ignored) {
            // The caller already has the useful error.
        }
    }

    private boolean needsRefresh(User user, GoogleCredential credential) {
        if (isBlank(user.getGoogleCalendarAccessToken())) {
            return true;
        }

        if (user.getGoogleCalendarTokenExpiresAt() == null) {
            return false;
        }

        long expirationTimeMs = user.getGoogleCalendarTokenExpiresAt()
                .atOffset(ZoneOffset.UTC)
                .toInstant()
                .toEpochMilli();
        credential.setExpirationTimeMilliseconds(expirationTimeMs);
        Long expiresInSeconds = credential.getExpiresInSeconds();
        return expiresInSeconds == null || expiresInSeconds <= 60;
    }

    private LocalDateTime toExpiryTime(Long expiresInSeconds) {
        if (expiresInSeconds == null) {
            return null;
        }
        return LocalDateTime.now(ZoneOffset.UTC).plusSeconds(expiresInSeconds);
    }

    private void clearGoogleCalendarTokens(User user) {
        user.setGoogleCalendarAccessToken(null);
        user.setGoogleCalendarRefreshToken(null);
        user.setGoogleCalendarTokenExpiresAt(null);
    }

    private String readableMessage(Throwable throwable) {
        Throwable current = throwable;
        while (current.getCause() != null) {
            current = current.getCause();
        }
        return current.getMessage() != null ? current.getMessage() : throwable.getMessage();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record PendingAuthorization(String userEmail, LocalDateTime expiresAt) {
    }
}
