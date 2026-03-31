# Requirements Document

## Introduction

This specification addresses critical UX issues in the JobHuntly application through a comprehensive refactoring that affects six major sections: page separation, chat system, job actions, location filtering, UX improvements, and technical architecture. The goal is to create a cohesive, scalable, and user-friendly job hunting platform with proper separation of concerns and real-time functionality.

## Glossary

- **Job_Posting_System**: The system responsible for displaying public job information
- **Application_Management_System**: The system responsible for managing user-specific application data
- **Chat_System**: The real-time messaging system between users and recruiters
- **Job_Action_System**: The system managing user interactions with jobs (save, share, report, reading list)
- **Location_Filter_System**: The system filtering companies by geographic location
- **Notification_System**: The system providing user feedback through toast messages
- **WebSocket_Service**: The real-time communication service using STOMP protocol
- **Database_Persistence_Layer**: The system ensuring all user actions are stored in the database
- **User_Interface_System**: The frontend system providing consistent user experience
- **Authentication_System**: The system managing user authentication and authorization

## Requirements

### Requirement 1: Separate Job Posting and Application Pages

**User Story:** As a user, I want distinct pages for viewing job postings and my applications, so that I can clearly differentiate between public job information and my personal application data.

#### Acceptance Criteria

1. THE Job_Posting_System SHALL display job postings at the route /jobs/:jobId
2. THE Job_Posting_System SHALL show only public job information including title, company, description, responsibilities, salary, location, and required skills
3. WHEN a user has already applied to a job, THE Job_Posting_System SHALL display an "Already Applied" badge and disable the apply button
4. THE Application_Management_System SHALL display application details at the route /applications/:applicationId
5. THE Application_Management_System SHALL show only user-specific data including application status, applied date, resume preview, cover letter, recruiter messages, and interview schedule
6. THE Job_Posting_System SHALL use JobResponseDTO for data transfer
7. THE Application_Management_System SHALL use ApplicationDetailsDTO for data transfer
8. THE Job_Posting_System SHALL NOT share components with the Application_Management_System
9. THE Application_Management_System SHALL NOT share API responses with the Job_Posting_System

### Requirement 2: Implement Functional Real-Time Chat System

**User Story:** As a user, I want a fully functional chat system with real-time messaging, so that I can communicate effectively with recruiters and receive instant notifications.

#### Acceptance Criteria

1. THE User_Interface_System SHALL display a chat icon in the navbar with unread message indicator
2. THE Chat_System SHALL provide real-time messaging using WebSocket with STOMP protocol
3. WHEN a message is sent, THE WebSocket_Service SHALL deliver it instantly to the recipient
4. THE Database_Persistence_Layer SHALL store all chat messages with id, senderId, receiverId, content, timestamp, and read status
5. THE Chat_System SHALL display unread count badge on the chat icon
6. THE Chat_System SHALL show a "new message dot" indicator for unread conversations
7. WHEN a user opens a chat conversation, THE Chat_System SHALL mark all messages as read
8. THE Chat_System SHALL display last message preview in conversation list
9. THE Chat_System SHALL provide APIs for message retrieval and WebSocket topics for real-time delivery

### Requirement 3: Implement Unified Job Actions System

**User Story:** As a user, I want all my job interactions (save, share, report, reading list) to be consistently stored and accessible, so that I can manage my job hunting activities effectively.

#### Acceptance Criteria

1. THE Job_Action_System SHALL persist all user actions in the database using JobAction entity
2. THE JobAction entity SHALL contain id, userId, jobId, actionType (SAVE, SHARE, REPORT, READ_LATER), and createdAt fields
3. THE Job_Action_System SHALL provide POST /job-actions endpoint for creating actions
4. THE Job_Action_System SHALL provide GET /job-actions/user/{userId} endpoint for retrieving user actions
5. WHEN a user performs a save action, THE Job_Action_System SHALL store it with actionType SAVE
6. WHEN a user performs a share action, THE Job_Action_System SHALL store it with actionType SHARE
7. WHEN a user performs a report action, THE Job_Action_System SHALL store it with actionType REPORT
8. WHEN a user adds to reading list, THE Job_Action_System SHALL store it with actionType READ_LATER
9. THE Job_Action_System SHALL display actions in appropriate filtered lists based on actionType
10. THE Job_Action_System SHALL NOT maintain any frontend-only state for job actions

### Requirement 4: Fix Location-Based Company Filtering

**User Story:** As a user, I want to filter companies by location in the Browse Companies section, so that I can find opportunities in my preferred geographic areas.

#### Acceptance Criteria

1. WHEN a user selects a location filter, THE User_Interface_System SHALL send location as query parameter to /companies?location={location}
2. THE Location_Filter_System SHALL implement case-insensitive partial matching using LIKE %:location% pattern
3. THE Location_Filter_System SHALL apply location filtering before pagination
4. WHEN no location is specified, THE Location_Filter_System SHALL return all companies
5. THE Location_Filter_System SHALL handle empty location parameters gracefully

### Requirement 5: Enhance User Interface Experience

**User Story:** As a user, I want consistent button labels, clear icons, and immediate feedback for my actions, so that I can navigate and interact with the application intuitively.

#### Acceptance Criteria

1. THE User_Interface_System SHALL rename "View Details" buttons to "View Application"
2. THE User_Interface_System SHALL rename "View Job Posting" buttons to "View Job"
3. THE User_Interface_System SHALL display eye icon for view actions
4. THE User_Interface_System SHALL display bookmark icon for save actions
5. THE User_Interface_System SHALL display share icon for share actions
6. THE User_Interface_System SHALL display flag icon for report actions
7. WHEN a user performs any job action, THE Notification_System SHALL display appropriate toast message
8. THE Notification_System SHALL show "Job saved" message for save actions
9. THE Notification_System SHALL show "Added to reading list" message for reading list actions
10. THE Notification_System SHALL show "Job shared" message for share actions
11. THE Notification_System SHALL show "Job reported" message for report actions

### Requirement 6: Establish Technical Architecture Standards

**User Story:** As a developer, I want clean separation of concerns and scalable architecture, so that the application is maintainable and can handle future growth.

#### Acceptance Criteria

1. THE Job_Posting_System SHALL maintain complete separation from the Application_Management_System
2. THE Database_Persistence_Layer SHALL ensure no duplicated logic across systems
3. THE WebSocket_Service SHALL integrate seamlessly with the Chat_System for real-time functionality
4. THE Authentication_System SHALL provide proper error handling for all user actions
5. THE User_Interface_System SHALL implement responsive design for all new components
6. THE Notification_System SHALL provide consistent toast notifications across all user actions
7. WHEN any system encounters an error, THE system SHALL provide descriptive error messages to users
8. THE WebSocket_Service SHALL maintain connection stability and handle reconnection scenarios
9. THE Database_Persistence_Layer SHALL ensure data consistency across all job action operations

### Requirement 7: Parse and Format Chat Messages

**User Story:** As a user, I want my chat messages to be properly formatted and stored, so that communication history is preserved and displayed correctly.

#### Acceptance Criteria

1. WHEN a chat message is received, THE Chat_System SHALL parse it into a ChatMessage object
2. WHEN displaying chat history, THE Chat_System SHALL format ChatMessage objects into readable text
3. THE Chat_System SHALL provide a message formatter for consistent display formatting
4. FOR ALL valid ChatMessage objects, parsing then formatting then parsing SHALL produce an equivalent object (round-trip property)
5. WHEN an invalid message format is received, THE Chat_System SHALL return a descriptive error

### Requirement 8: Parse and Format Job Action Data

**User Story:** As a developer, I want job action data to be properly serialized and deserialized, so that user interactions are accurately stored and retrieved.

#### Acceptance Criteria

1. WHEN a job action request is received, THE Job_Action_System SHALL parse it into a JobAction object
2. WHEN returning job action data, THE Job_Action_System SHALL format JobAction objects into appropriate response DTOs
3. THE Job_Action_System SHALL provide a job action formatter for consistent API responses
4. FOR ALL valid JobAction objects, parsing then formatting then parsing SHALL produce an equivalent object (round-trip property)
5. WHEN invalid job action data is received, THE Job_Action_System SHALL return a descriptive error message