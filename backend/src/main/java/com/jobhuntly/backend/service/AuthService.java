package com.jobhuntly.backend.service;

import com.jobhuntly.backend.dto.AuthResponse;
import com.jobhuntly.backend.dto.LoginRequest;
import com.jobhuntly.backend.dto.RegisterRequest;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private TokenService tokenService;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        // Create new user
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Set user type
        try {
            user.setUserType(User.UserType.valueOf(request.getUserType().toUpperCase()));
        } catch (IllegalArgumentException e) {
            user.setUserType(User.UserType.JOBSEEKER); // Default to jobseeker
        }
        
        // Save user
        user = userRepository.save(user);
        
        // Generate tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        
        // Save tokens to database
        tokenService.saveAccessToken(accessToken, user);
        tokenService.saveRefreshToken(refreshToken, user);
        
        return new AuthResponse(accessToken, refreshToken, user);
    }
    
    public AuthResponse login(LoginRequest request) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );
            
            // Get user details
            User user = (User) authentication.getPrincipal();
            
            // Verify user type matches request (optional validation)
            if (request.getUserType() != null && !request.getUserType().isEmpty()) {
                try {
                    User.UserType requestedType = User.UserType.valueOf(request.getUserType().toUpperCase());
                    if (!user.getUserType().equals(requestedType)) {
                        throw new RuntimeException("Invalid user type for this account");
                    }
                } catch (IllegalArgumentException e) {
                    // Invalid user type in request, ignore and proceed
                }
            }
            
            // Generate new tokens
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);
            
            // Save tokens to database
            tokenService.saveAccessToken(accessToken, user);
            tokenService.saveRefreshToken(refreshToken, user);
            
            return new AuthResponse(accessToken, refreshToken, user);
            
        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid email or password");
        }
    }
    
    public AuthResponse refreshToken(String refreshToken) {
        try {
            // Validate refresh token format
            if (!jwtService.isTokenExpired(refreshToken)) {
                String username = jwtService.extractUsername(refreshToken);
                
                // Check if token exists in database and is valid
                if (tokenService.isRefreshTokenValid(refreshToken)) {
                    User user = userRepository.findByEmailAndIsActiveTrue(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                    
                    // Mark refresh token as used
                    tokenService.markRefreshTokenAsUsed(refreshToken);
                    
                    // Generate new tokens
                    String newAccessToken = jwtService.generateAccessToken(user);
                    String newRefreshToken = jwtService.generateRefreshToken(user);
                    
                    // Save new tokens
                    tokenService.saveAccessToken(newAccessToken, user);
                    tokenService.saveRefreshToken(newRefreshToken, user);
                    
                    // Revoke old refresh token
                    tokenService.revokeRefreshToken(refreshToken);
                    
                    return new AuthResponse(newAccessToken, newRefreshToken, user);
                }
            }
            throw new RuntimeException("Invalid or expired refresh token");
        } catch (Exception e) {
            throw new RuntimeException("Invalid refresh token");
        }
    }
    
    public void logout(String accessToken) {
        try {
            if (accessToken != null && !accessToken.isEmpty()) {
                // Extract user from token
                String username = jwtService.extractUsername(accessToken);
                User user = userRepository.findByEmailAndIsActiveTrue(username).orElse(null);
                
                if (user != null) {
                    // Revoke current access token
                    tokenService.revokeAccessToken(accessToken);
                    
                    // Optionally revoke all user tokens for complete logout
                    // tokenService.revokeAllUserTokens(user);
                }
            }
        } catch (Exception e) {
            // Log error but don't throw exception for logout
        }
    }
    
    public void logoutAll(String accessToken) {
        try {
            if (accessToken != null && !accessToken.isEmpty()) {
                String username = jwtService.extractUsername(accessToken);
                User user = userRepository.findByEmailAndIsActiveTrue(username).orElse(null);
                
                if (user != null) {
                    // Revoke all user tokens
                    tokenService.revokeAllUserTokens(user);
                }
            }
        } catch (Exception e) {
            // Log error but don't throw exception for logout
        }
    }


    public AuthResponse getCurrentUser(String accessToken) {
        try {
            // Validate token is not expired
            if (jwtService.isTokenExpired(accessToken)) {
                throw new RuntimeException("Token expired");
            }

            // Extract username from token
            String username = jwtService.extractUsername(accessToken);

            // Check if token exists in database and is valid
            if (!tokenService.isAccessTokenValid(accessToken)) {
                throw new RuntimeException("Invalid token");
            }

            // Get user from database
            User user = userRepository.findByEmailAndIsActiveTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Return user info without generating new tokens
            return new AuthResponse(null, null, user);

        } catch (Exception e) {
            throw new RuntimeException("Failed to get current user: " + e.getMessage());
        }
    }
}