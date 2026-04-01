package com.jobhuntly.backend.controller;

import com.jobhuntly.backend.dto.UserDTO;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.repository.UserRepository;
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

    private UserDTO toUserDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getUserType() != null ? user.getUserType().name() : null,
                user.getLocation(),
                user.getDescription(),
                user.getWebsite(),
                user.getIndustry(),
                user.getCompanySize()
        );
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getNetworkUsers(Authentication authentication) {
        String email = authentication.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<User> jobseekers = userRepository.findByUserTypeAndIdNot(User.UserType.JOBSEEKER, currentUser.getId());

        List<UserDTO> dtos = jobseekers.stream()
                .map(this::toUserDTO)
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

        return ResponseEntity.ok(toUserDTO(requestedUser));
    }
}
