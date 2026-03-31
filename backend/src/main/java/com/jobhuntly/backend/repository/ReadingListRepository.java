package com.jobhuntly.backend.repository;

import com.jobhuntly.backend.entity.ReadingListItem;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReadingListRepository extends JpaRepository<ReadingListItem, Long> {
    
    List<ReadingListItem> findByUserOrderByAddedAtDesc(User user);
    
    List<ReadingListItem> findByUserAndIsReadOrderByAddedAtDesc(User user, Boolean isRead);
    
    Optional<ReadingListItem> findByUserAndJob(User user, Job job);
    
    boolean existsByUserAndJob(User user, Job job);
    
    @Query("SELECT COUNT(r) FROM ReadingListItem r WHERE r.user = :user AND r.isRead = false")
    long countUnreadByUser(@Param("user") User user);
    
    void deleteByUserAndJob(User user, Job job);
}