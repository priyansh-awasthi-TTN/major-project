import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.model.ConferenceData;
import com.google.api.services.calendar.model.ConferenceSolutionKey;
import com.google.api.services.calendar.model.CreateConferenceRequest;
import com.google.api.client.util.DateTime;
import java.io.FileInputStream;
import java.util.Collections;
import java.util.Date;
import java.util.UUID;

public class TestMeet {
    public static void main(String[] args) throws Exception {
        GoogleCredential credential = GoogleCredential.fromStream(new FileInputStream("target/classes/google-credentials.json"))
                .createScoped(Collections.singleton(CalendarScopes.CALENDAR));
        Calendar service = new Calendar.Builder(GoogleNetHttpTransport.newTrustedTransport(), GsonFactory.getDefaultInstance(), credential)
                .setApplicationName("JobHuntly")
                .build();
        
        Event event = new Event()
                .setSummary("Test Meeting")
                .setDescription("Meeting created via JobHuntly");

        DateTime start = new DateTime(new Date());
        EventDateTime startDateTime = new EventDateTime().setDateTime(start).setTimeZone("Asia/Kolkata");
        event.setStart(startDateTime);
        DateTime end = new DateTime(new Date(System.currentTimeMillis() + 3600000));
        EventDateTime endDateTime = new EventDateTime().setDateTime(end).setTimeZone("Asia/Kolkata");
        event.setEnd(endDateTime);

        ConferenceSolutionKey conferenceSolutionKey = new ConferenceSolutionKey().setType("hangoutsMeet");
        CreateConferenceRequest createConferenceRequest = new CreateConferenceRequest()
                .setRequestId(UUID.randomUUID().toString())
                .setConferenceSolutionKey(conferenceSolutionKey);
        ConferenceData conferenceData = new ConferenceData().setCreateRequest(createConferenceRequest);
        event.setConferenceData(conferenceData);

        try {
            event = service.events().insert("harshajais.hj@gmail.com", event)
                    .setConferenceDataVersion(1)
                    .execute();
            System.out.println("Success! Link: " + event.getHangoutLink());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
