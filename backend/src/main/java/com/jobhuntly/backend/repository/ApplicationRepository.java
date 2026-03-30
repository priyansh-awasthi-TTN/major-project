package com.jobhuntly.backend.repository;

import com.jobhuntly.backend.entity.Application;
import com.jobhuntly.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByUserOrderByDateAppliedDesc(User user);

    List<Application> findTop5ByUserOrderByDateAppliedDesc(User user);

    List<Application> findByJobIdInOrderByDateAppliedDesc(List<Long> jobIds);

    long countByUser(User user);

    long countByUserAndStatus(User user, String status);

    boolean existsByUserAndJobId(User user, Long jobId);

    @Query("SELECT a FROM Application a WHERE a.user = :user AND a.dateApplied BETWEEN :start AND :end ORDER BY a.dateApplied DESC")
    List<Application> findByUserAndDateRange(@Param("user") User user,
                                              @Param("start") LocalDate start,
                                              @Param("end") LocalDate end);

    @Query("SELECT a.status, COUNT(a) FROM Application a WHERE a.user = :user GROUP BY a.status")
    List<Object[]> countByUserGroupByStatus(@Param("user") User user);
}
