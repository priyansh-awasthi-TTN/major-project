# Google Meet Integration Setup Guide

## Current Implementation

The application now generates Google Meet-style links (`https://meet.google.com/xxx-yyyy-zzz`). However, **these links won't work as actual Google Meet rooms** because Google Meet requires proper API authentication.

## Why Random Links Don't Work

Google Meet validates meeting codes against their database. Random codes will show "Check your meeting code" error because:
1. Meeting rooms must be created through Google Calendar API
2. Requires OAuth 2.0 authentication
3. Needs proper Google Cloud Project setup

## To Enable REAL Google Meet (Production Setup)

### Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Calendar API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure OAuth consent screen:
   - User Type: External
   - App name: JobHuntly
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
4. Create OAuth Client ID:
   - Application type: Web application
   - Name: JobHuntly Backend
   - Authorized redirect URIs:
     ```
     http://localhost:8080/oauth2/callback/google
     http://localhost:8080/login/oauth2/code/google
     ```
5. Download the credentials JSON file

### Step 3: Configure Backend

1. Add credentials to `backend/src/main/resources/application.properties`:

```properties
# Google Calendar API Configuration
google.client.id=YOUR_CLIENT_ID_HERE
google.client.secret=YOUR_CLIENT_SECRET_HERE
google.redirect.uri=http://localhost:8080/oauth2/callback/google
google.calendar.api.key=YOUR_API_KEY_HERE
```

2. Store the credentials JSON file:
```bash
mkdir -p backend/src/main/resources/google
# Place your credentials.json file here
cp ~/Downloads/credentials.json backend/src/main/resources/google/
```

### Step 4: Implement OAuth Flow

The backend needs to implement OAuth 2.0 flow to get user authorization. Add this controller:

```java
@RestController
@RequestMapping("/api/oauth2")
public class GoogleOAuthController {
    
    @GetMapping("/google/authorize")
    public ResponseEntity<Map<String, String>> getAuthorizationUrl() {
        // Generate authorization URL
        String authUrl = googleCalendarService.getAuthorizationUrl();
        return ResponseEntity.ok(Map.of("authUrl", authUrl));
    }
    
    @GetMapping("/callback/google")
    public ResponseEntity<?> handleCallback(@RequestParam String code) {
        // Exchange code for tokens
        googleCalendarService.handleAuthorizationCode(code);
        return ResponseEntity.ok("Authorization successful");
    }
}
```

### Step 5: Update GoogleCalendarService

Implement full OAuth flow in `GoogleCalendarService.java`:

```java
public Calendar getCalendarService(String userId) throws IOException, GeneralSecurityException {
    NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
    
    // Load credentials from stored tokens
    Credential credential = loadCredential(userId);
    
    return new Calendar.Builder(httpTransport, JSON_FACTORY, credential)
        .setApplicationName(APPLICATION_NAME)
        .build();
}

public String createRealGoogleMeetLink(String userId, String summary, 
                                      LocalDateTime start, LocalDateTime end) {
    try {
        Calendar service = getCalendarService(userId);
        return createRealGoogleMeetEvent(service, summary, start, end);
    } catch (Exception e) {
        throw new RuntimeException("Failed to create Google Meet link", e);
    }
}
```

### Step 6: Frontend OAuth Flow

Update frontend to handle OAuth:

```javascript
// Trigger OAuth flow
const authorizeGoogleCalendar = async () => {
  const response = await apiService.getGoogleAuthUrl();
  window.open(response.authUrl, '_blank');
};

// Then generate meet link after authorization
const generateMeetLink = async () => {
  const response = await apiService.createGoogleMeetLink({
    summary: form.title,
    startTime: startDateTime,
    endTime: endDateTime,
  });
  onChange('meetingLink', response.meetLink);
};
```

## Alternative: Use Service Account (No User OAuth)

For backend-only access without user interaction:

1. Create Service Account in Google Cloud Console
2. Download service account JSON key
3. Share your Google Calendar with the service account email
4. Use service account credentials in code

```java
GoogleCredential credential = GoogleCredential
    .fromStream(new FileInputStream("service-account-key.json"))
    .createScoped(Collections.singleton(CalendarScopes.CALENDAR));
```

## Testing

After setup, test the integration:

1. Start backend: `cd backend && mvn spring-boot:run`
2. Authorize Google Calendar access
3. Create event with "Add Google Meet"
4. Verify real meet.google.com link is generated
5. Click link - should open working Google Meet room

## Security Notes

- Never commit credentials to git
- Use environment variables for production
- Implement token refresh mechanism
- Store user tokens securely (encrypted in database)
- Implement proper error handling for expired tokens

## Current Workaround

Until full OAuth is implemented, the app generates Google Meet-style links that look authentic but won't work. For immediate working video conferences, consider:

1. **Jitsi Meet** - Free, no API required
2. **Whereby** - Simple setup
3. **Daily.co** - Developer-friendly API

## Need Help?

- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Meet API](https://developers.google.com/meet)
