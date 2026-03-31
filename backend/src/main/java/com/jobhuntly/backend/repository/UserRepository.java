package com.jobhuntly.backend.repository;

import com.jobhuntly.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    Optional<User> findByEmailAndIsActiveTrue(String email);

    List<User> findByUserTypeAndIdNot(User.UserType userType, Long currentUserId);
    
    List<User> findByUserType(User.UserType userType);
    
    List<User> findByUserTypeAndLocationContainingIgnoreCase(User.UserType userType, String location);
}