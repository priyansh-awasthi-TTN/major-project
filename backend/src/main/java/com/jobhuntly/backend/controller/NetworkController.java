package com.jobhuntly.backend.controller;

import com.jobhuntly.backend.dto.UserDTO;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getNetworkUsers(Authentication authentication) {
        String email = authentication.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<User> jobseekers = userRepository.findByUserTypeAndIdNot(User.UserType.JOBSEEKER, currentUser.getId());

        List<UserDTO> dtos = jobseekers.stream()
                .map(u -> new UserDTO(u.getId(), u.getFullName(), u.getEmail()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}
