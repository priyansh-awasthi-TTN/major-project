package com.jobhuntly.backend.repository;

import com.jobhuntly.backend.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    boolean existsByTitleAndCompany(String title, String company);
    List<Job> findAllByOrderByCreatedAtDesc();
    List<Job> findByPostedByUserId(Long postedByUserId);
}
