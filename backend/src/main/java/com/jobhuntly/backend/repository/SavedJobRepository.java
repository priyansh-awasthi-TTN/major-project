package com.jobhuntly.backend.repository;

import com.jobhuntly.backend.entity.SavedJob;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    
    List<SavedJob> findByUserOrderBySavedAtDesc(User user);
    
    Optional<SavedJob> findByUserAndJob(User user, Job job);
    
    boolean existsByUserAndJob(User user, Job job);
    
    @Query("SELECT COUNT(s) FROM SavedJob s WHERE s.user = :user")
    long countByUser(@Param("user") User user);
    
    void deleteByUserAndJob(User user, Job job);
}