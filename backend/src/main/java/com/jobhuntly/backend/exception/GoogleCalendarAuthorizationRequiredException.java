package com.jobhuntly.backend.exception;

public class GoogleCalendarAuthorizationRequiredException extends RuntimeException {

    public GoogleCalendarAuthorizationRequiredException(String message) {
        super(message);
    }
}
