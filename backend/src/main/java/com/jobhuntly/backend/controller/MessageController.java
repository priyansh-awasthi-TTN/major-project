package com.jobhuntly.backend.controller;

import com.jobhuntly.backend.dto.ChatMessageDTO;
import com.jobhuntly.backend.entity.ChatMessage;
import com.jobhuntly.backend.entity.User;
import com.jobhuntly.backend.repository.ChatMessageRepository;
import com.jobhuntly.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessageDTO chatMessageDTO, Authentication authentication) {
        String email = authentication.getName();
        User sender = userRepository.findByEmail(email).orElse(null);
        User recipient = userRepository.findById(chatMessageDTO.getRecipientId()).orElse(null);

        if (sender != null && recipient != null) {
            ChatMessage message = new ChatMessage(sender, recipient, chatMessageDTO.getContent());
            ChatMessage savedMsg = chatMessageRepository.save(message);

            ChatMessageDTO responseDto = new ChatMessageDTO(
                    savedMsg.getId(),
                    savedMsg.getSender().getId(),
                    savedMsg.getRecipient().getId(),
                    savedMsg.getContent(),
                    savedMsg.getTimestamp(),
                    savedMsg.isRead()
            );

            messagingTemplate.convertAndSendToUser(
                    recipient.getEmail(), "/queue/messages", responseDto
            );
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<ChatMessageDTO>> getChatHistory(@PathVariable Long userId, Authentication authentication) {
        String email = authentication.getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        User otherUser = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        List<ChatMessage> messages = chatMessageRepository.findChatHistory(currentUser, otherUser);

        List<ChatMessageDTO> dtos = messages.stream()
                .map(m -> new ChatMessageDTO(
                        m.getId(),
                        m.getSender().getId(),
                        m.getRecipient().getId(),
                        m.getContent(),
                        m.getTimestamp(),
                        m.isRead()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}
