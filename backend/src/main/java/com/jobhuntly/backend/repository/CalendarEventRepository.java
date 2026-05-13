package com.jobhuntly.backend.repository;

import com.jobhuntly.backend.entity.CalendarEvent;
import com.jobhuntly.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    @Query("""
        select e
        from CalendarEvent e
        join fetch e.category c
        where e.owner = :owner
          and e.endAt > :rangeStart
          and e.startAt < :rangeEnd
        order by e.startAt asc, e.endAt asc
        """)
    List<CalendarEvent> findByOwnerAndOverlappingRange(
            @Param("owner") User owner,
            @Param("rangeStart") LocalDateTime rangeStart,
            @Param("rangeEnd") LocalDateTime rangeEnd
    );

    Optional<CalendarEvent> findByIdAndOwnerId(Long id, Long ownerId);

    long countByCategoryId(Long categoryId);
}
