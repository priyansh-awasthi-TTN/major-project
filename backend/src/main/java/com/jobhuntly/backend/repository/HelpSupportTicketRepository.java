package com.jobhuntly.backend.repository;

import com.jobhuntly.backend.entity.HelpSupportTicket;
import com.jobhuntly.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HelpSupportTicketRepository extends JpaRepository<HelpSupportTicket, Long> {
    List<HelpSupportTicket> findByUserOrderByCreatedAtDesc(User user);
}
