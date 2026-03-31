package com.jobhuntly.backend.repository;

import com.jobhuntly.backend.entity.JobReport;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobReportRepository extends JpaRepository<JobReport, Long> {
    
    List<JobReport> findByUserOrderByReportedAtDesc(User user);
    
    List<JobReport> findByJobOrderByReportedAtDesc(Job job);
    
    Optional<JobReport> findByUserAndJob(User user, Job job);
    
    boolean existsByUserAndJob(User user, Job job);
    
    @Query("SELECT COUNT(r) FROM JobReport r WHERE r.job = :job")
    long countByJob(@Param("job") Job job);
    
    @Query("SELECT r FROM JobReport r WHERE r.status = :status ORDER BY r.reportedAt DESC")
    List<JobReport> findByStatus(@Param("status") JobReport.ReportStatus status);
}