package com.jobhuntly.backend.repository;

import com.jobhuntly.backend.entity.ChatMessage;
import com.jobhuntly.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE (m.sender = :userA AND m.recipient = :userB) OR (m.sender = :userB AND m.recipient = :userA) ORDER BY m.timestamp ASC")
    List<ChatMessage> findChatHistory(@Param("userA") User userA, @Param("userB") User userB);
    
    List<ChatMessage> findByRecipientAndIsReadFalse(User recipient);
}
