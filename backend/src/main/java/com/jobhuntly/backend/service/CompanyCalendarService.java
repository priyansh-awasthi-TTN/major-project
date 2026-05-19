package com.jobhuntly.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobhuntly.backend.dto.CalendarCategoryDTO;
import com.jobhuntly.backend.dto.CalendarCategoryRequest;
import com.jobhuntly.backend.dto.CalendarEventDTO;
import com.jobhuntly.backend.dto.CalendarEventRequest;
import com.jobhuntly.backend.dto.CalendarResponse;
import com.jobhuntly.backend.entity.CalendarCategory;
import com.jobhuntly.backend.entity.Application;
import com.jobhuntly.backend.entity.CalendarEvent;
import com.jobhuntly.backend.entity.Notification;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.repository.ApplicationRepository;
import com.jobhuntly.backend.repository.CalendarCategoryRepository;
import com.jobhuntly.backend.repository.CalendarEventRepository;
import com.jobhuntly.backend.repository.NotificationRepository;
import com.jobhuntly.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class CompanyCalendarService {

    private static final Pattern HEX_COLOR = Pattern.compile("^#[0-9a-fA-F]{6}$");
    private static final List<String> ALLOWED_AVAILABILITY = List.of("BUSY", "FREE");
    private static final List<String> ALLOWED_VISIBILITY = List.of("DEFAULT", "PUBLIC", "PRIVATE");
    private static final List<Map<String, String>> DEFAULT_CATEGORIES = List.of(
            Map.of("name", "Interview Schedule", "color", "#0ea5e9"),
            Map.of("name", "Internal Meeting", "color", "#10b981"),
            Map.of("name", "Team Schedule", "color", "#6366f1"),
            Map.of("name", "My Task", "color", "#f59e0b"),
            Map.of("name", "Reminders", "color", "#fb7185")
    );

    private final UserRepository userRepository;
    private final CalendarCategoryRepository categoryRepository;
    private final CalendarEventRepository eventRepository;
    private final ObjectMapper objectMapper;
    private final GoogleCalendarService googleCalendarService;
    private final ApplicationRepository applicationRepository;
    private final NotificationRepository notificationRepository;

    @Autowired
    public CompanyCalendarService(
            UserRepository userRepository,
            CalendarCategoryRepository categoryRepository,
            CalendarEventRepository eventRepository,
            ObjectMapper objectMapper,
            GoogleCalendarService googleCalendarService,
            ApplicationRepository applicationRepository,
            NotificationRepository notificationRepository
    ) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.eventRepository = eventRepository;
        this.objectMapper = objectMapper;
        this.googleCalendarService = googleCalendarService;
        this.applicationRepository = applicationRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public CalendarResponse getCalendar(String email, LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Calendar range is required");
        }
        if (endDate.isBefore(startDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Calendar range is invalid");
        }

        User companyUser = getCompanyUser(email);
        ensureDefaultCategories(companyUser);

        List<CalendarCategoryDTO> categories = categoryRepository.findByUserOrderByDisplayOrderAscNameAsc(companyUser)
                .stream()
                .map(this::toCategoryDTO)
                .toList();

        LocalDateTime rangeStart = startDate.atStartOfDay();
        LocalDateTime rangeEnd = endDate.plusDays(1).atStartOfDay();

        List<CalendarEventDTO> events = eventRepository.findByOwnerAndOverlappingRange(companyUser, rangeStart, rangeEnd)
                .stream()
                .map(this::toEventDTO)
                .toList();

        CalendarResponse response = new CalendarResponse();
        response.setStartDate(startDate);
        response.setEndDate(endDate);
        response.setCategories(categories);
        response.setEvents(events);
        return response;
    }

    @Transactional
    public CalendarCategoryDTO createCategory(String email, CalendarCategoryRequest request) {
        User companyUser = getCompanyUser(email);
        ensureDefaultCategories(companyUser);

        String normalizedName = normalizeName(request.getName(), "Category name is required");
        if (categoryRepository.existsByUserIdAndNameIgnoreCase(companyUser.getId(), normalizedName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A category with that name already exists");
        }

        CalendarCategory category = new CalendarCategory();
        category.setUser(companyUser);
        category.setName(normalizedName);
        category.setColor(normalizeColor(request.getColor()));
        category.setVisible(request.getVisible() == null || request.getVisible());
        category.setDefaultCategory(false);
        category.setDisplayOrder((int) categoryRepository.countByUserId(companyUser.getId()));
        return toCategoryDTO(categoryRepository.save(category));
    }

    @Transactional
    public CalendarCategoryDTO updateCategory(String email, Long categoryId, CalendarCategoryRequest request) {
        User companyUser = getCompanyUser(email);
        ensureDefaultCategories(companyUser);

        CalendarCategory category = getOwnedCategory(companyUser, categoryId);
        String normalizedName = normalizeName(request.getName(), "Category name is required");

        if (!normalizedName.equalsIgnoreCase(category.getName())
                && categoryRepository.existsByUserIdAndNameIgnoreCase(companyUser.getId(), normalizedName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A category with that name already exists");
        }

        category.setName(normalizedName);
        category.setColor(normalizeColor(request.getColor()));
        category.setVisible(request.getVisible() == null || request.getVisible());
        return toCategoryDTO(categoryRepository.save(category));
    }

    @Transactional
    public CalendarEventDTO createEvent(String email, CalendarEventRequest request) {
        User companyUser = getCompanyUser(email);
        ensureDefaultCategories(companyUser);

        CalendarEvent event = new CalendarEvent();
        event.setOwner(companyUser);
        applyEventRequest(event, request, companyUser);
        event = eventRepository.save(event);
        notifyAndUpdateApplicants(event, companyUser);
        return toEventDTO(event);
    }

    @Transactional
    public CalendarEventDTO updateEvent(String email, Long eventId, CalendarEventRequest request) {
        User companyUser = getCompanyUser(email);
        ensureDefaultCategories(companyUser);

        CalendarEvent event = eventRepository.findByIdAndOwnerId(eventId, companyUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendar event not found"));

        applyEventRequest(event, request, companyUser);
        event = eventRepository.save(event);
        notifyAndUpdateApplicants(event, companyUser);
        return toEventDTO(event);
    }

    @Transactional
    public void deleteEvent(String email, Long eventId) {
        User companyUser = getCompanyUser(email);
        CalendarEvent event = eventRepository.findByIdAndOwnerId(eventId, companyUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendar event not found"));
        eventRepository.delete(event);
    }

    /**
     * Creates a Google Meet link for the event.
     */
    @Transactional
    public String createGoogleMeetLink(String email, Map<String, Object> eventDetails) {
        User companyUser = getCompanyUser(email);

        String summary = normalizeName((String) eventDetails.getOrDefault("summary", eventDetails.getOrDefault("title", "Meeting")),
                "Meeting summary is required");

        LocalDateTime startAt = readDateTime(eventDetails, "startAt", "startTime");
        LocalDateTime endAt = readDateTime(eventDetails, "endAt", "endTime");

        if (startAt == null || endAt == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Meeting start and end time are required");
        }

        if (!endAt.isAfter(startAt)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Meeting end time must be after start time");
        }

        return googleCalendarService.createGoogleMeetLink(companyUser, summary, startAt, endAt);
    }

    private LocalDateTime readDateTime(Map<String, Object> payload, String... keys) {
        for (String key : keys) {
            Object value = payload.get(key);
            if (value == null) {
                continue;
            }
            if (value instanceof LocalDateTime) {
                return (LocalDateTime) value;
            }
            if (value instanceof String) {
                try {
                    return LocalDateTime.parse((String) value);
                } catch (DateTimeParseException e) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date-time format for " + key);
                }
            }
        }
        return null;
    }

    private void ensureDefaultCategories(User companyUser) {
        if (categoryRepository.countByUserId(companyUser.getId()) > 0) {
            return;
        }

        List<CalendarCategory> categories = new ArrayList<>();
        for (int index = 0; index < DEFAULT_CATEGORIES.size(); index++) {
            Map<String, String> definition = DEFAULT_CATEGORIES.get(index);
            CalendarCategory category = new CalendarCategory();
            category.setUser(companyUser);
            category.setName(definition.get("name"));
            category.setColor(definition.get("color"));
            category.setVisible(true);
            category.setDefaultCategory(true);
            category.setDisplayOrder(index);
            categories.add(category);
        }

        categoryRepository.saveAll(categories);
    }

    private void applyEventRequest(CalendarEvent event, CalendarEventRequest request, User companyUser) {
        String title = normalizeName(request.getTitle(), "Event title is required");
        if (request.getStartAt() == null || request.getEndAt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event start and end time are required");
        }
        if (!request.getEndAt().isAfter(request.getStartAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event end time must be after start time");
        }

        CalendarCategory category;
        if (request.getCategoryId() == null) {
            category = categoryRepository.findByUserOrderByDisplayOrderAscNameAsc(companyUser).get(0);
        } else {
            category = getOwnedCategory(companyUser, request.getCategoryId());
        }

        event.setCategory(category);
        event.setTitle(title);
        event.setDescription(normalizeText(request.getDescription()));
        event.setLocation(normalizeText(request.getLocation()));
        event.setMeetingLink(normalizeText(request.getMeetingLink()));
        event.setStartAt(request.getStartAt());
        event.setEndAt(request.getEndAt());
        event.setAllDay(request.getAllDay() != null && request.getAllDay());
        event.setAvailability(normalizeChoice(request.getAvailability(), ALLOWED_AVAILABILITY, "BUSY", "Invalid availability"));
        event.setVisibility(normalizeChoice(request.getVisibility(), ALLOWED_VISIBILITY, "DEFAULT", "Invalid visibility"));
        event.setReminderMinutes(normalizeReminderMinutes(request.getReminderMinutes()));
        event.setAttendeesJson(writeAttendees(request.getAttendees()));
    }

    private void notifyAndUpdateApplicants(CalendarEvent event, User companyUser) {
        List<String> attendees = readAttendees(event.getAttendeesJson());
        for (String attendeeEmail : attendees) {
            userRepository.findByEmailAndIsActiveTrue(attendeeEmail).ifPresent(applicant -> {
                List<Application> apps = applicationRepository.findByApplicantAndCompanyJobOrderByDateAppliedDesc(applicant, companyUser.getId());
                if (!apps.isEmpty()) {
                    Application app = apps.get(0);
                    app.setInterviewDate(event.getStartAt());
                    app.setMeetLink(event.getMeetingLink());
                    
                    if (!List.of("Interviewing", "Interview").contains(app.getStatus())) {
                        app.setStatus("Interviewing");
                    }
                    applicationRepository.save(app);

                    Notification notification = new Notification();
                    notification.setRecipient(applicant);
                    String companyName = companyUser.getCurrentCompany() != null ? companyUser.getCurrentCompany() : companyUser.getFullName();
                    notification.setActorName(companyName);
                    notification.setCategory("Application");
                    notification.setType("Interview");
                    notification.setText("has scheduled an interview with you on " + event.getStartAt().toString().replace("T", " ") + ".");
                    notification.setBadge("📅");
                    notification.setBadgeColor("purple");
                    notificationRepository.save(notification);
                }
            });
        }
    }

    private User getCompanyUser(String email) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getUserType() != User.UserType.COMPANY) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only company accounts can manage schedule data");
        }

        return user;
    }

    private CalendarCategory getOwnedCategory(User companyUser, Long categoryId) {
        return categoryRepository.findByIdAndUserId(categoryId, companyUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendar category not found"));
    }

    private CalendarCategoryDTO toCategoryDTO(CalendarCategory category) {
        CalendarCategoryDTO dto = new CalendarCategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setColor(category.getColor());
        dto.setVisible(category.getVisible());
        dto.setDefaultCategory(category.getDefaultCategory());
        return dto;
    }

    private CalendarEventDTO toEventDTO(CalendarEvent event) {
        CalendarEventDTO dto = new CalendarEventDTO();
        dto.setId(event.getId());
        dto.setCategoryId(event.getCategory().getId());
        dto.setCategoryName(event.getCategory().getName());
        dto.setCategoryColor(event.getCategory().getColor());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setLocation(event.getLocation());
        dto.setMeetingLink(event.getMeetingLink());
        dto.setAttendees(readAttendees(event.getAttendeesJson()));
        dto.setStartAt(event.getStartAt());
        dto.setEndAt(event.getEndAt());
        dto.setAllDay(event.getAllDay());
        dto.setAvailability(event.getAvailability());
        dto.setVisibility(event.getVisibility());
        dto.setReminderMinutes(event.getReminderMinutes());
        return dto;
    }

    private String normalizeName(String value, String errorMessage) {
        String normalized = normalizeText(value);
        if (normalized == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, errorMessage);
        }
        return normalized;
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeColor(String value) {
        String normalized = normalizeText(value);
        if (normalized == null) {
            return "#4f46e5";
        }
        if (!HEX_COLOR.matcher(normalized).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category color must be a valid hex code");
        }
        return normalized.toLowerCase(Locale.ROOT);
    }

    private String normalizeChoice(String value, List<String> allowedValues, String defaultValue, String errorMessage) {
        String normalized = normalizeText(value);
        if (normalized == null) {
            return defaultValue;
        }

        String upper = normalized.toUpperCase(Locale.ROOT);
        if (!allowedValues.contains(upper)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, errorMessage);
        }
        return upper;
    }

    private Integer normalizeReminderMinutes(Integer value) {
        if (value == null) {
            return 30;
        }
        if (value < 0 || value > 10080) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reminder must be between 0 and 10080 minutes");
        }
        return value;
    }

    private String writeAttendees(List<String> attendees) {
        List<String> normalizedAttendees = attendees == null
                ? List.of()
                : attendees.stream()
                .map(this::normalizeText)
                .filter(value -> value != null)
                .distinct()
                .toList();

        try {
            return objectMapper.writeValueAsString(normalizedAttendees);
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to process attendees");
        }
    }

    private List<String> readAttendees(String attendeesJson) {
        if (attendeesJson == null || attendeesJson.isBlank()) {
            return List.of();
        }

        try {
            return objectMapper.readValue(attendeesJson, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException exception) {
            return List.of();
        }
    }
}
