package com.jobhuntly.backend.repository;

import com.jobhuntly.backend.entity.AccessToken;
import com.jobhuntly.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccessTokenRepository extends JpaRepository<AccessToken, Long> {
    
    Optional<AccessToken> findByTokenId(String tokenId);
    
    List<AccessToken> findByUserAndIsRevokedFalse(User user);
    
    @Modifying
    @Query("UPDATE AccessToken at SET at.isRevoked = true WHERE at.user = :user")
    void revokeAllTokensByUser(@Param("user") User user);
    
    @Modifying
    @Query("UPDATE AccessToken at SET at.isRevoked = true WHERE at.expiresAt < :now")
    void revokeExpiredTokens(@Param("now") LocalDateTime now);
    
    @Query("SELECT at FROM AccessToken at WHERE at.tokenId = :tokenId AND at.isRevoked = false AND at.expiresAt > :now")
    Optional<AccessToken> findValidTokenByTokenId(@Param("tokenId") String tokenId, @Param("now") LocalDateTime now);
}