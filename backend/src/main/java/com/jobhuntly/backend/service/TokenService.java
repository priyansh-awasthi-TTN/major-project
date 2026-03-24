package com.jobhuntly.backend.service;

import com.jobhuntly.backend.entity.AccessToken;
import com.jobhuntly.backend.entity.RefreshToken;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.repository.AccessTokenRepository;
import com.jobhuntly.backend.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@Transactional
public class TokenService {
    
    @Autowired
    private AccessTokenRepository accessTokenRepository;
    
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    
    @Autowired
    private JwtService jwtService;
    
    public void saveAccessToken(String token, User user) {
        try {
            String tokenId = jwtService.extractTokenId(token);
            String tokenHash = hashToken(token);
            LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(jwtService.getAccessTokenExpiration() / 1000);
            
            AccessToken accessToken = new AccessToken(tokenId, tokenHash, user, expiresAt);
            accessTokenRepository.save(accessToken);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save access token", e);
        }
    }
    
    public void saveRefreshToken(String token, User user) {
        try {
            String tokenId = jwtService.extractTokenId(token);
            String tokenHash = hashToken(token);
            LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(jwtService.getRefreshTokenExpiration() / 1000);
            
            RefreshToken refreshToken = new RefreshToken(tokenId, tokenHash, user, expiresAt);
            refreshTokenRepository.save(refreshToken);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save refresh token", e);
        }
    }
    
    public boolean isAccessTokenValid(String token) {
        try {
            String tokenId = jwtService.extractTokenId(token);
            Optional<AccessToken> tokenEntity = accessTokenRepository.findValidTokenByTokenId(tokenId, LocalDateTime.now());
            
            if (tokenEntity.isPresent()) {
                String tokenHash = hashToken(token);
                return tokenEntity.get().getTokenHash().equals(tokenHash);
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
    
    public boolean isRefreshTokenValid(String token) {
        try {
            String tokenId = jwtService.extractTokenId(token);
            Optional<RefreshToken> tokenEntity = refreshTokenRepository.findValidTokenByTokenId(tokenId, LocalDateTime.now());
            
            if (tokenEntity.isPresent()) {
                String tokenHash = hashToken(token);
                return tokenEntity.get().getTokenHash().equals(tokenHash);
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
    
    public void revokeAccessToken(String token) {
        try {
            String tokenId = jwtService.extractTokenId(token);
            Optional<AccessToken> tokenEntity = accessTokenRepository.findByTokenId(tokenId);
            tokenEntity.ifPresent(accessToken -> {
                accessToken.setIsRevoked(true);
                accessTokenRepository.save(accessToken);
            });
        } catch (Exception e) {
            // Log error but don't throw exception
        }
    }
    
    public void revokeRefreshToken(String token) {
        try {
            String tokenId = jwtService.extractTokenId(token);
            Optional<RefreshToken> tokenEntity = refreshTokenRepository.findByTokenId(tokenId);
            tokenEntity.ifPresent(refreshToken -> {
                refreshToken.setIsRevoked(true);
                refreshTokenRepository.save(refreshToken);
            });
        } catch (Exception e) {
            // Log error but don't throw exception
        }
    }
    
    public void revokeAllUserTokens(User user) {
        accessTokenRepository.revokeAllTokensByUser(user);
        refreshTokenRepository.revokeAllTokensByUser(user);
    }
    
    public void markRefreshTokenAsUsed(String token) {
        try {
            String tokenId = jwtService.extractTokenId(token);
            Optional<RefreshToken> tokenEntity = refreshTokenRepository.findByTokenId(tokenId);
            tokenEntity.ifPresent(refreshToken -> {
                refreshToken.markAsUsed();
                refreshTokenRepository.save(refreshToken);
            });
        } catch (Exception e) {
            // Log error but don't throw exception
        }
    }
    
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        accessTokenRepository.revokeExpiredTokens(now);
        refreshTokenRepository.revokeExpiredTokens(now);
    }
    
    private String hashToken(String token) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(token.getBytes());
        return Base64.getEncoder().encodeToString(hash);
    }
}