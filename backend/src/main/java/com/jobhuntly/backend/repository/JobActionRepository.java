package com.jobhuntly.backend.repository;

import com.jobhuntly.backend.entity.Job;
import com.jobhuntly.backend.entity.JobAction;
import com.jobhuntly.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface JobActionRepository extends JpaRepository<JobAction, Long> {
    
    // Check if action exists
    boolean existsByUserAndJobAndActionType(User user, Job job, JobAction.ActionType actionType);
    
    // Delete specific action
    @Modifying
    @Transactional
    void deleteByUserAndJobAndActionType(User user, Job job, JobAction.ActionType actionType);
    
    // Get all actions by user
    List<JobAction> findByUserOrderByCreatedAtDesc(User user);
    
    // Get actions by type
    @Query("SELECT ja FROM JobAction ja WHERE ja.user = :user AND ja.actionType = :actionType ORDER BY ja.createdAt DESC")
    List<JobAction> findByUserAndActionTypeOrderByCreatedAtDesc(@Param("user") User user, @Param("actionType") JobAction.ActionType actionType);
    
    // Saved jobs
    @Query("SELECT ja FROM JobAction ja JOIN FETCH ja.job WHERE ja.user = :user AND ja.actionType = 'SAVE' ORDER BY ja.createdAt DESC")
    List<JobAction> findSavedJobsByUser(@Param("user") User user);
    
    // Reading list
    @Query("SELECT ja FROM JobAction ja JOIN FETCH ja.job WHERE ja.user = :user AND ja.actionType = 'READ_LATER' ORDER BY ja.createdAt DESC")
    List<JobAction> findReadingListByUser(@Param("user") User user);
    
    // Reported jobs
    @Query("SELECT ja FROM JobAction ja JOIN FETCH ja.job WHERE ja.user = :user AND ja.actionType = 'REPORT' ORDER BY ja.createdAt DESC")
    List<JobAction> findReportedJobsByUser(@Param("user") User user);
    
    // Shared jobs
    @Query("SELECT ja FROM JobAction ja JOIN FETCH ja.job WHERE ja.user = :user AND ja.actionType = 'SHARE' ORDER BY ja.createdAt DESC")
    List<JobAction> findSharedJobsByUser(@Param("user") User user);
    
    // Count actions by type
    @Query("SELECT COUNT(ja) FROM JobAction ja WHERE ja.user = :user AND ja.actionType = :actionType")
    long countByUserAndActionType(@Param("user") User user, @Param("actionType") JobAction.ActionType actionType);
    
    // Get actions for a specific job
    List<JobAction> findByJobOrderByCreatedAtDesc(Job job);
    
    // Get action statistics
    @Query("SELECT ja.actionType, COUNT(ja) FROM JobAction ja WHERE ja.job = :job GROUP BY ja.actionType")
    List<Object[]> getJobActionStatistics(@Param("job") Job job);
}
