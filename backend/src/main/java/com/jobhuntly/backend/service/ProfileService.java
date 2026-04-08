package com.jobhuntly.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobhuntly.backend.dto.AuthResponse;
import com.jobhuntly.backend.dto.LoginDetailsUpdateRequest;
import com.jobhuntly.backend.dto.NotificationPreferencesUpdateRequest;
import com.jobhuntly.backend.dto.ProfileEducationDTO;
import com.jobhuntly.backend.dto.ProfileExperienceDTO;
import com.jobhuntly.backend.dto.UserDTO;
import com.jobhuntly.backend.dto.UserProfileUpdateRequest;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenService tokenService;

    @Autowired
    public ProfileService(
            UserRepository userRepository,
            ObjectMapper objectMapper,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            TokenService tokenService
    ) {
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenService = tokenService;
    }

    @Transactional(readOnly = true)
    public UserDTO getCurrentProfile(String email) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toUserDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Requested user not found"));
        return toUserDTO(user);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getProfilesByUserTypeExcluding(User.UserType userType, Long excludedUserId) {
        return userRepository.findByUserTypeAndIdNot(userType, excludedUserId)
                .stream()
                .map(this::toUserDTO)
                .toList();
    }

    @Transactional
    public UserDTO updateCurrentProfile(String email, UserProfileUpdateRequest request) {
        User user = getActiveUser(email);

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getTitle() != null) {
            user.setHeadline(normalizeText(request.getTitle()));
        }
        if (request.getCompany() != null) {
            user.setCurrentCompany(normalizeText(request.getCompany()));
        }
        if (request.getLocation() != null) {
            user.setLocation(normalizeText(request.getLocation()));
        }
        if (request.getAbout() != null) {
            user.setDescription(normalizeText(request.getAbout()));
        }
        if (request.getPhone() != null) {
            user.setPhone(normalizeText(request.getPhone()));
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(parseDateOfBirth(request.getDateOfBirth()));
        }
        if (request.getGender() != null) {
            user.setGender(parseGender(request.getGender()));
        }
        if (request.getUserType() != null) {
            user.setUserType(parseUserType(request.getUserType()));
        }
        if (request.getLanguages() != null) {
            user.setLanguages(normalizeText(request.getLanguages()));
        }
        if (request.getInstagram() != null) {
            user.setInstagramUrl(normalizeText(request.getInstagram()));
        }
        if (request.getTwitter() != null) {
            user.setTwitterUrl(normalizeText(request.getTwitter()));
        }
        if (request.getWebsite() != null) {
            user.setWebsite(normalizeText(request.getWebsite()));
        }
        if (request.getIndustry() != null) {
            user.setIndustry(normalizeText(request.getIndustry()));
        }
        if (request.getCompanySize() != null) {
            user.setCompanySize(normalizeText(request.getCompanySize()));
        }
        if (request.getProfilePhotoUrl() != null) {
            user.setProfilePhotoUrl(normalizeText(request.getProfilePhotoUrl()));
        }
        if (request.getCoverPhotoUrl() != null) {
            user.setCoverPhotoUrl(normalizeText(request.getCoverPhotoUrl()));
        }

        if (request.getOpenToOpportunities() != null) {
            user.setOpenToOpportunities(request.getOpenToOpportunities());
        }

        if (request.getSkills() != null) {
            user.setSkillsJson(writeJson(request.getSkills()));
        }

        if (request.getExperiences() != null) {
            user.setExperiencesJson(writeJson(request.getExperiences()));
        }

        if (request.getEducations() != null) {
            user.setEducationsJson(writeJson(request.getEducations()));
        }

        return toUserDTO(userRepository.save(user));
    }

    @Transactional
    public AuthResponse updateLoginDetails(String email, LoginDetailsUpdateRequest request) {
        User user = getActiveUser(email);
        String currentPassword = request.getCurrentPassword();

        if (currentPassword == null || currentPassword.isBlank() || !passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        String nextEmail = normalizeEmail(request.getEmail());
        String nextPassword = request.getNewPassword();
        boolean emailChanged = nextEmail != null && !nextEmail.equalsIgnoreCase(user.getEmail());
        boolean passwordChanged = nextPassword != null && !nextPassword.isBlank();

        if (!emailChanged && !passwordChanged) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provide a new email or password");
        }

        if (emailChanged) {
            ensureEmailAvailable(nextEmail);
            user.setEmail(nextEmail);
        }

        if (passwordChanged) {
            if (nextPassword.length() < 8) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 8 characters");
            }
            user.setPassword(passwordEncoder.encode(nextPassword));
        }

        User savedUser = userRepository.save(user);
        tokenService.revokeAllUserTokens(savedUser);

        String accessToken = jwtService.generateAccessToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);
        tokenService.saveAccessToken(accessToken, savedUser);
        tokenService.saveRefreshToken(refreshToken, savedUser);

        return new AuthResponse(accessToken, refreshToken, savedUser);
    }

    @Transactional
    public UserDTO updateNotificationPreferences(String email, NotificationPreferencesUpdateRequest request) {
        User user = getActiveUser(email);

        if (request.getApplicationNotifications() != null) {
            user.setApplicationNotifications(request.getApplicationNotifications());
        }
        if (request.getJobNotifications() != null) {
            user.setJobNotifications(request.getJobNotifications());
        }
        if (request.getRecommendationNotifications() != null) {
            user.setRecommendationNotifications(request.getRecommendationNotifications());
        }

        return toUserDTO(userRepository.save(user));
    }

    public UserDTO toUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setUserType(user.getUserType() != null ? user.getUserType().name() : null);
        dto.setLocation(user.getLocation());
        dto.setDescription(user.getDescription());
        dto.setWebsite(user.getWebsite());
        dto.setIndustry(user.getIndustry());
        dto.setCompanySize(user.getCompanySize());
        dto.setTitle(user.getHeadline());
        dto.setCompany(user.getCurrentCompany());
        dto.setPhone(user.getPhone());
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setGender(user.getGender() != null ? user.getGender().name() : null);
        dto.setLanguages(user.getLanguages());
        dto.setInstagram(user.getInstagramUrl());
        dto.setTwitter(user.getTwitterUrl());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        dto.setCoverPhotoUrl(user.getCoverPhotoUrl());
        dto.setOpenToOpportunities(user.getOpenToOpportunities());
        dto.setApplicationNotifications(user.getApplicationNotifications());
        dto.setJobNotifications(user.getJobNotifications());
        dto.setRecommendationNotifications(user.getRecommendationNotifications());
        dto.setSkills(readJson(user.getSkillsJson(), new TypeReference<List<String>>() {}));
        dto.setExperiences(readJson(user.getExperiencesJson(), new TypeReference<List<ProfileExperienceDTO>>() {}));
        dto.setEducations(readJson(user.getEducationsJson(), new TypeReference<List<ProfileEducationDTO>>() {}));
        return dto;
    }

    private User getActiveUser(String email) {
        return userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeEmail(String value) {
        String normalized = normalizeText(value);
        return normalized == null ? null : normalized.toLowerCase(Locale.ROOT);
    }

    private void ensureEmailAvailable(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
        }
    }

    private LocalDate parseDateOfBirth(String value) {
        String normalized = normalizeText(value);
        if (normalized == null) {
            return null;
        }

        try {
            return LocalDate.parse(normalized);
        } catch (DateTimeParseException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date of birth must use YYYY-MM-DD format");
        }
    }

    private User.Gender parseGender(String value) {
        String normalized = normalizeText(value);
        if (normalized == null) {
            return null;
        }

        try {
            return User.Gender.valueOf(normalized.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid gender value");
        }
    }

    private User.UserType parseUserType(String value) {
        String normalized = normalizeText(value);
        if (normalized == null) {
            return null;
        }

        try {
            return User.UserType.valueOf(normalized.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid account type");
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value == null ? Collections.emptyList() : value);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to serialize profile data");
        }
    }

    private <T> T readJson(String rawJson, TypeReference<T> typeReference) {
        if (rawJson == null || rawJson.isBlank()) {
            try {
                return objectMapper.readValue("[]", typeReference);
            } catch (JsonProcessingException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read profile data");
            }
        }

        try {
            return objectMapper.readValue(rawJson, typeReference);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read profile data");
        }
    }
}
