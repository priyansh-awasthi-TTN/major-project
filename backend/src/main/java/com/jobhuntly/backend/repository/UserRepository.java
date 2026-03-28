package com.jobhuntly.backend.repository;

import com.jobhuntly.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    Optional<User> findByEmailAndIsActiveTrue(String email);

    java.util.List<User> findByUserTypeAndIdNot(com.jobhuntly.backend.entity.User.UserType userType, Long currentUserId);
}