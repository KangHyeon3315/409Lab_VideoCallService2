package com.lab409.backend.service;

import com.lab409.backend.controller.ChatHandler;
import com.lab409.backend.dto.chat.info.ChatInfo;
import com.lab409.backend.dto.chat.info.Member;
import com.lab409.backend.dto.chat.response.ChatInfoRes;
import com.lab409.backend.dto.common.response.DefaultRes;
import com.lab409.backend.dto.user.response.UserInfoRes;
import com.lab409.backend.entity.Chat;
import com.lab409.backend.entity.ChatJoin;
import com.lab409.backend.entity.ChatRoom;
import com.lab409.backend.entity.User;
import com.lab409.backend.repository.ChatJoinRepository;
import com.lab409.backend.repository.ChatRepository;
import com.lab409.backend.repository.ChatRoomRepository;
import com.lab409.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatService {
    private static SimpleDateFormat DatetimeFormatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private final UserRepository userRepository;
    private final ChatRepository chatRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatJoinRepository chatJoinRepository;

    private String generateUUID() {
        String uuid = UUID.randomUUID().toString();
        uuid = uuid.replace("-", "");

        if (chatRoomRepository.countById(uuid) > 0) {
            return generateUUID();
        }

        return uuid;
    }

    public DefaultRes createChatRoom(String title, String[] userIds) {
        for (String userId : userIds) {
            if (userRepository.countByUsername(userId) == 0) {
                return new DefaultRes(false, "사용자를 찾을 수 없습니다.");
            }
        }

        String uuid = generateUUID();
        ChatRoom chatRoom = ChatRoom.builder()
                .id(uuid)
                .title(title)
                .build();

        chatRoomRepository.save(chatRoom);

        for (String userId : userIds) {
            Optional<User> user = userRepository.findByUsername(userId);

            if (!user.isPresent()) {
                return new DefaultRes(false, "사용자를 찾을 수 없습니다.");
            }


            ChatJoin chatJoin = ChatJoin.builder()
                    .user(user.get())
                    .roomInfo(chatRoom)
                    .build();

            chatJoinRepository.save(chatJoin);
        }

        return new DefaultRes(true, null);
    }

    public DefaultRes exitChatRoom(String chatId, String userId) {
        Optional<User> user = userRepository.findByUsername(userId);

        if (!user.isPresent()) {
            return new DefaultRes(false, "사용자를 찾을 수 없습니다.");
        }

        Optional<ChatRoom> chatRoom = chatRoomRepository.findById(chatId);
        if (!chatRoom.isPresent()) {
            return new DefaultRes(false, "채팅방을 찾을 수 없습니다.");
        }

        Optional<ChatJoin> chatJoin = chatJoinRepository.findByUserAndRoomInfo(user.get(), chatRoom.get());

        if (!chatJoin.isPresent()) {
            return new DefaultRes(false, "해당 채티방에 가입한 사용자가 아닙니다.");
        }

        chatJoinRepository.delete(chatJoin.get());

        if (chatJoinRepository.countByRoomInfo(chatRoom.get()) == 0) {

            chatRepository.deleteAllByRoomInfo(chatRoom.get());

            chatRoomRepository.delete(chatRoom.get());
        }

        return new DefaultRes(true, null);
    }

    public DefaultRes inviteChatRoom(String chatId, String[] userIds) {

        Optional<ChatRoom> chatRoom = chatRoomRepository.findById(chatId);
        if (!chatRoom.isPresent()) {
            return new DefaultRes(false, "채팅방을 찾을 수 없습니다.");
        }

        List<ChatJoin> joinList = new ArrayList<>();
        for (String userId : userIds) {
            Optional<User> user = userRepository.findByUsername(userId);
            if (!user.isPresent()) {
                return new DefaultRes(false, "사용자를 찾을 수 없습니다.");
            }

            ChatJoin chatJoin = ChatJoin.builder()
                    .user(user.get())
                    .roomInfo(chatRoom.get())
                    .build();
            joinList.add(chatJoin);
        }

        chatJoinRepository.saveAll(joinList);

        return new DefaultRes(true, null);
    }

    public ChatInfoRes getChatInfo(String chatId, String userId) {
        Optional<ChatRoom> chatRoom = chatRoomRepository.findById(chatId);
        if (!chatRoom.isPresent()) {
            return new ChatInfoRes(false, "채팅방을 찾을 수 없습니다.", null, null, null);
        }

        List<Chat> chatList = chatRepository.findTop100ByRoomInfoOrderBySendTimeDesc(chatRoom.get());
        Collections.reverse(chatList);

        List<ChatInfo> chatInfoList = new ArrayList<>();
        for (Chat chat : chatList) {
            User sender = chat.getSender();

            ChatInfo info = new ChatInfo(chat.getId(), chat.getType(), sender.getUsername(), sender.getNickname(), DatetimeFormatter.format(chat.getSendTime()), chat.getChat());
            chatInfoList.add(info);
        }

        List<Member> userList = new ArrayList<>();
        List<ChatJoin> joinList = chatJoinRepository.findAllByRoomInfo(chatRoom.get());
        for (ChatJoin join : joinList) {
            User user = join.getUser();
            userList.add(new Member(user.getUsername(), user.getNickname()));
        }

        return new ChatInfoRes(true, null, chatRoom.get().getTitle(), chatInfoList, userList);
    }
}
