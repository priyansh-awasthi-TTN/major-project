package com.jobhuntly.backend.service;

import com.jobhuntly.backend.dto.ChatMessageDTO;
import com.jobhuntly.backend.entity.ChatMessage;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.repository.ChatMessageRepository;
import com.jobhuntly.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatService {
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Transactional
    public ChatMessageDTO sendMessage(String senderEmail, Long receiverId, String content, String messageType) {
        User sender = userRepository.findByEmail(senderEmail)
            .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        User receiver = userRepository.findById(receiverId)
            .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        ChatMessage message = new ChatMessage(sender, receiver, content, messageType);
        ChatMessage savedMessage = chatMessageRepository.save(message);
        
        // Convert to DTO
        ChatMessageDTO messageDTO = convertToDTO(savedMessage);
        
        // Send real-time notification to receiver
        messagingTemplate.convertAndSendToUser(
            receiver.getEmail(),
            "/queue/messages",
            messageDTO
        );
        
        // Also send to sender for confirmation
        messagingTemplate.convertAndSendToUser(
            sender.getEmail(),
            "/queue/messages",
            messageDTO
        );
        
        return messageDTO;
    }
    
    public List<ChatMessageDTO> getMessagesBetweenUsers(String userEmail, Long otherUserId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        User otherUser = userRepository.findById(otherUserId)
            .orElseThrow(() -> new RuntimeException("Other user not found"));
        
        List<ChatMessage> messages = chatMessageRepository.findMessagesBetweenUsers(user, otherUser);
        List<ChatMessageDTO> messageDTOs = new ArrayList<>();
        
        for (ChatMessage message : messages) {
            messageDTOs.add(convertToDTO(message));
        }
        
        return messageDTOs;
    }
    
    public List<Map<String, Object>> getConversations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<ChatMessage> recentMessages = chatMessageRepository.findRecentConversations(user);
        List<Map<String, Object>> conversations = new ArrayList<>();
        
        for (ChatMessage message : recentMessages) {
            User otherUser = message.getSender().equals(user) ? message.getReceiver() : message.getSender();
            long unreadCount = chatMessageRepository.countUnreadMessagesBetweenUsers(otherUser, user);
            
            Map<String, Object> conversation = new HashMap<>();
            conversation.put("userId", otherUser.getId());
            conversation.put("userName", otherUser.getFullName());
            conversation.put("userEmail", otherUser.getEmail());
            conversation.put("userType", otherUser.getUserType().toString());
            conversation.put("lastMessage", convertToDTO(message));
            conversation.put("unreadCount", unreadCount);
            
            conversations.add(conversation);
        }
        
        return conversations;
    }
    
    public long getUnreadMessageCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return chatMessageRepository.countUnreadMessages(user);
    }
    
    public long getUnreadMessageCountBetweenUsers(String userEmail, Long otherUserId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        User otherUser = userRepository.findById(otherUserId)
            .orElseThrow(() -> new RuntimeException("Other user not found"));
        
        return chatMessageRepository.countUnreadMessagesBetweenUsers(otherUser, user);
    }
    
    @Transactional
    public void markMessagesAsRead(String userEmail, Long otherUserId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        User otherUser = userRepository.findById(otherUserId)
            .orElseThrow(() -> new RuntimeException("Other user not found"));
        
        chatMessageRepository.markMessagesAsRead(otherUser, user);
        
        // Notify the other user that messages have been read
        Map<String, Object> readNotification = new HashMap<>();
        readNotification.put("type", "MESSAGES_READ");
        readNotification.put("readByUserId", user.getId());
        readNotification.put("readByUserName", user.getFullName());
        
        messagingTemplate.convertAndSendToUser(
            otherUser.getEmail(),
            "/queue/notifications",
            readNotification
        );
    }
    
    private ChatMessageDTO convertToDTO(ChatMessage message) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(message.getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(message.getSender().getFullName());
        dto.setSenderEmail(message.getSender().getEmail());
        dto.setReceiverId(message.getReceiver().getId());
        dto.setReceiverName(message.getReceiver().getFullName());
        dto.setReceiverEmail(message.getReceiver().getEmail());
        dto.setContent(message.getContent());
        dto.setMessageType(message.getMessageType());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setRead(message.isRead());
        return dto;
    }
}