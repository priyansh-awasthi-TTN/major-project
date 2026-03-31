package com.jobhuntly.backend.repository;

import com.jobhuntly.backend.entity.ChatMessage;
import com.jobhuntly.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // Get messages between two users
    @Query("SELECT cm FROM ChatMessage cm WHERE " +
           "(cm.sender = :user1 AND cm.receiver = :user2) OR " +
           "(cm.sender = :user2 AND cm.receiver = :user1) " +
           "ORDER BY cm.createdAt ASC")
    List<ChatMessage> findMessagesBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
    
    // Get all conversations for a user (distinct users they've chatted with)
    @Query("SELECT DISTINCT CASE " +
           "WHEN cm.sender = :user THEN cm.receiver " +
           "ELSE cm.sender END " +
           "FROM ChatMessage cm WHERE cm.sender = :user OR cm.receiver = :user")
    List<User> findConversationPartners(@Param("user") User user);
    
    // Get unread message count for a user
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.receiver = :user AND cm.isRead = false")
    long countUnreadMessages(@Param("user") User user);
    
    // Get unread message count between two users
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.sender = :sender AND cm.receiver = :receiver AND cm.isRead = false")
    long countUnreadMessagesBetweenUsers(@Param("sender") User sender, @Param("receiver") User receiver);
    
    // Mark messages as read
    @Query("UPDATE ChatMessage cm SET cm.isRead = true WHERE cm.sender = :sender AND cm.receiver = :receiver AND cm.isRead = false")
    void markMessagesAsRead(@Param("sender") User sender, @Param("receiver") User receiver);
    
    // Get latest message between two users
    @Query("SELECT cm FROM ChatMessage cm WHERE " +
           "(cm.sender = :user1 AND cm.receiver = :user2) OR " +
           "(cm.sender = :user2 AND cm.receiver = :user1) " +
           "ORDER BY cm.createdAt DESC LIMIT 1")
    ChatMessage findLatestMessageBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
    
    // Get recent conversations with latest message info
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.id IN (" +
           "SELECT MAX(cm2.id) FROM ChatMessage cm2 WHERE " +
           "(cm2.sender = :user OR cm2.receiver = :user) " +
           "GROUP BY CASE WHEN cm2.sender = :user THEN cm2.receiver.id ELSE cm2.sender.id END" +
           ") ORDER BY cm.createdAt DESC")
    List<ChatMessage> findRecentConversations(@Param("user") User user);
}