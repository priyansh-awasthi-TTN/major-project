package com.jobhuntly.backend.repository;

import com.jobhuntly.backend.entity.CalendarCategory;
import com.jobhuntly.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CalendarCategoryRepository extends JpaRepository<CalendarCategory, Long> {

    List<CalendarCategory> findByUserOrderByDisplayOrderAscNameAsc(User user);

    Optional<CalendarCategory> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    boolean existsByUserIdAndNameIgnoreCase(Long userId, String name);
}
