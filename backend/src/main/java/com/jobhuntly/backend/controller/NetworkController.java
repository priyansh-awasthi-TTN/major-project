package com.jobhuntly.backend.controller;

import com.jobhuntly.backend.dto.UserDTO;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.repository.UserRepository;
import com.jobhuntly.backend.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/network")
public class NetworkController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileService profileService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getNetworkUsers(Authentication authentication) {
        String email = authentication.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<User> jobseekers = userRepository.findByUserTypeAndIdNot(User.UserType.JOBSEEKER, currentUser.getId());

        List<UserDTO> dtos = jobseekers.stream()
                .map(profileService::toUserDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDTO> getNetworkUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        User requestedUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Requested user not found"));

        return ResponseEntity.ok(profileService.toUserDTO(requestedUser));
    }
}
