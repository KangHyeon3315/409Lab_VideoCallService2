package com.lab409.backend.controller;

import com.lab409.backend.dto.chat.response.ChatInfoRes;
import com.lab409.backend.dto.common.response.DefaultRes;
import com.lab409.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/join")
    public DefaultRes createChatRoom(String title, @RequestParam(name = "userIds[]") String[] userIds) {
        return chatService.createChatRoom(title, userIds);

    }

    @DeleteMapping("/exit")
    public DefaultRes exitChatRoom(String chatId, String userId) {
        return chatService.exitChatRoom(chatId, userId);
    }

    @PostMapping("/invite")
    public DefaultRes inviteChatRoom(String chatId, String userId) {
        return chatService.inviteChatRoom(chatId, userId);
    }

    @GetMapping("/info")
    public ChatInfoRes getChatInfo(String chatId, String userId) {
        return chatService.getChatInfo(chatId, userId);
    }
}
