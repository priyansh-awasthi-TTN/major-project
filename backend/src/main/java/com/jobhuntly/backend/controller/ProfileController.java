package com.jobhuntly.backend.controller;

import com.jobhuntly.backend.dto.UserDTO;
import com.jobhuntly.backend.dto.UserProfileUpdateRequest;
import com.jobhuntly.backend.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class ProfileController {

    private final ProfileService profileService;

    @Autowired
    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentProfile(Authentication authentication) {
        return ResponseEntity.ok(profileService.getCurrentProfile(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateCurrentProfile(
            Authentication authentication,
            @RequestBody UserProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(profileService.updateCurrentProfile(authentication.getName(), request));
    }
}
