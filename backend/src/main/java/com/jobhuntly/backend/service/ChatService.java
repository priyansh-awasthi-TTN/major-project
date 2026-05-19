package com.jobhuntly.backend.service;

import com.jobhuntly.backend.dto.ChatMessageDTO;
import com.jobhuntly.backend.entity.ChatMessage;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.repository.ApplicationRepository;
import com.jobhuntly.backend.repository.ChatMessageRepository;
import com.jobhuntly.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Transactional
    public ChatMessageDTO sendMessage(String senderEmail, Long receiverId, String content, String messageType, String fileUrl) {
        User sender = userRepository.findByEmail(senderEmail)
            .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        User receiver = userRepository.findById(receiverId)
            .orElseThrow(() -> new RuntimeException("Receiver not found"));

        assertCanChat(sender, receiver);
        
        ChatMessage message = new ChatMessage(
            sender,
            receiver,
            content,
            messageType != null ? messageType : "TEXT",
            fileUrl
        );
        ChatMessage savedMessage = chatMessageRepository.save(message);
        
        // Convert to DTO
        ChatMessageDTO messageDTO = convertToDTO(savedMessage);
        
        // Send real-time notification to receiver
        messagingTemplate.convertAndSend(
            "/topic/messages/" + receiver.getId(),
            messageDTO
        );
        
        // Also send to sender for confirmation
        messagingTemplate.convertAndSend(
            "/topic/messages/" + sender.getId(),
            messageDTO
        );
        
        return messageDTO;
    }
    
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getMessagesBetweenUsers(String userEmail, Long otherUserId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        User otherUser = userRepository.findById(otherUserId)
            .orElseThrow(() -> new RuntimeException("Other user not found"));

        assertCanChat(user, otherUser);
        
        List<ChatMessage> messages = chatMessageRepository.findMessagesBetweenUsers(user, otherUser);
        List<ChatMessageDTO> messageDTOs = new ArrayList<>();
        
        for (ChatMessage message : messages) {
            messageDTOs.add(convertToDTO(message));
        }
        
        return messageDTOs;
    }
    
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getConversations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<ChatMessage> recentMessages = chatMessageRepository.findRecentConversations(user);
        List<Map<String, Object>> conversations = new ArrayList<>();
        
        for (ChatMessage message : recentMessages) {
            User otherUser = message.getSender().getId().equals(user.getId()) ? message.getReceiver() : message.getSender();
            if (!canChat(user, otherUser)) {
                continue;
            }
            long unreadCount = chatMessageRepository.countUnreadMessagesBetweenUsers(otherUser, user);
            
            Map<String, Object> conversation = new HashMap<>();
            conversation.put("userId", otherUser.getId());
            conversation.put("userName", getDisplayName(otherUser));
            conversation.put("userEmail", otherUser.getEmail());
            conversation.put("userType", otherUser.getUserType().toString());
            conversation.put("lastMessage", convertToDTO(message));
            conversation.put("unreadCount", unreadCount);
            
            conversations.add(conversation);
        }
        
        return conversations;
    }
    
    @Transactional(readOnly = true)
    public long getUnreadMessageCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return chatMessageRepository.findUnreadMessages(user).stream()
            .filter(message -> canChat(user, message.getSender()))
            .count();
    }
    
    @Transactional(readOnly = true)
    public long getUnreadMessageCountBetweenUsers(String userEmail, Long otherUserId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        User otherUser = userRepository.findById(otherUserId)
            .orElseThrow(() -> new RuntimeException("Other user not found"));

        assertCanChat(user, otherUser);
        
        return chatMessageRepository.countUnreadMessagesBetweenUsers(otherUser, user);
    }
    
    @Transactional
    public void markMessagesAsRead(String userEmail, Long otherUserId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        User otherUser = userRepository.findById(otherUserId)
            .orElseThrow(() -> new RuntimeException("Other user not found"));

        assertCanChat(user, otherUser);
        
        chatMessageRepository.markMessagesAsRead(otherUser, user);
        
        // Notify the other user that messages have been read
        Map<String, Object> readNotification = new HashMap<>();
        readNotification.put("type", "MESSAGES_READ");
        readNotification.put("readByUserId", user.getId());
        readNotification.put("readByUserName", getDisplayName(user));

        messagingTemplate.convertAndSend(
            "/topic/messages/" + otherUser.getId() + "/notifications",
            readNotification
        );
    }

    private void assertCanChat(User user, User otherUser) {
        if (!canChat(user, otherUser)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Companies can only message applicants who have applied to one of their jobs."
            );
        }
    }

    private boolean canChat(User user, User otherUser) {
        if (user == null || otherUser == null || user.getId() == null || otherUser.getId() == null) {
            return false;
        }
        if (user.getId().equals(otherUser.getId())) {
            return false;
        }

        boolean userIsCompany = user.getUserType() == User.UserType.COMPANY;
        boolean otherUserIsCompany = otherUser.getUserType() == User.UserType.COMPANY;

        if (!userIsCompany && !otherUserIsCompany) {
            return true;
        }
        if (userIsCompany == otherUserIsCompany) {
            return false;
        }

        User company = userIsCompany ? user : otherUser;
        User applicant = userIsCompany ? otherUser : user;

        return applicant.getUserType() == User.UserType.JOBSEEKER
            && applicationRepository.existsByApplicantAndCompanyJob(applicant, company.getId());
    }
    
    private ChatMessageDTO convertToDTO(ChatMessage message) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(message.getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(getDisplayName(message.getSender()));
        dto.setSenderEmail(message.getSender().getEmail());
        dto.setReceiverId(message.getReceiver().getId());
        dto.setReceiverName(getDisplayName(message.getReceiver()));
        dto.setReceiverEmail(message.getReceiver().getEmail());
        dto.setContent(message.getContent());
        dto.setMessageType(message.getMessageType());
        dto.setFileUrl(message.getFileUrl());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setRead(message.isRead());
        return dto;
    }

    private String getDisplayName(User user) {
        if (user == null) {
            return "";
        }

        if (user.getUserType() == User.UserType.COMPANY) {
            String recruiterName = user.getRecruiterName();
            if (recruiterName != null && !recruiterName.isBlank()) {
                return recruiterName.trim();
            }
        }

        return user.getFullName();
    }
}
