package com.lab409.backend.controller;

import com.lab409.backend.config.JwtTokenProvider;
import com.lab409.backend.dto.chat.info.Member;
import com.lab409.backend.dto.chat.info.UserInfo;
import com.lab409.backend.entity.Chat;
import com.lab409.backend.entity.ChatRoom;
import com.lab409.backend.entity.User;
import com.lab409.backend.repository.ChatRepository;
import com.lab409.backend.repository.ChatRoomRepository;
import com.lab409.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;

@Component
@RequiredArgsConstructor
public class ChatHandler extends TextWebSocketHandler {
    // private static final HashMap<String, WebSocketSession> sessionMap = new HashMap<>();

    private static final HashMap<String, UserInfo> userMap = new HashMap<>();
    private static final HashMap<String, List<String>> roomMemberMap = new HashMap<>(); // Key : RoomId, Value : Member Id List

    private static final SimpleDateFormat DT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    private final JwtTokenProvider jwtTokenProvider;
    private final ChatRepository chatRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JSONObject payload = new JSONObject(message.getPayload());
        if (!payload.has("type")) return;

        try {
            switch (payload.getString("type")) {
                case "Join": {
                    String token = payload.getString("token");
                    if (!jwtTokenProvider.validateToken(token)) {
                        deleteUserSession(session);
                        System.out.println("Token is not validate");
                        return;
                    }
                    String userId = jwtTokenProvider.getUserId(token);

                    String userName = payload.getString("name");

                    UserInfo userInfo = new UserInfo(token, userId, userName, session);
                    userMap.put(userId, userInfo);
                    break;
                }
                case "Enter": { // 채팅방 접속할 때 사용
                    String token = payload.getString("token");
                    if (!jwtTokenProvider.validateToken(token)) {
                        deleteUserSession(session);
                        System.out.println("Token is not validate");
                        return;
                    }
                    String userId = jwtTokenProvider.getUserId(token);
                    UserInfo userInfo = userMap.get(userId);

                    String oldRoomId = userInfo.getRoomId();
                    if (oldRoomId != null) {
                        roomMemberMap.get(oldRoomId).remove(userId);
                    }

                    String roomId = payload.getString("roomId");
                    List<String> memberList = roomMemberMap.getOrDefault(roomId, null);
                    if (memberList == null) {
                        memberList = new ArrayList<>();
                        roomMemberMap.put(roomId, memberList);
                    }
                    memberList.add(roomId);
                    break;
                }
                case "Chat": {
                    String token = payload.getString("token");
                    if (!jwtTokenProvider.validateToken(token)) {
                        deleteUserSession(session);
                        System.out.println("Token is not validate");
                        return;
                    }

                    String roomId = payload.getString("room");
                    Optional<ChatRoom> chatRoom = chatRoomRepository.findById(roomId);
                    if (!chatRoom.isPresent()) {
                        deleteUserSession(session);
                        System.out.println("can not find room");
                        return;
                    }

                    String senderId = jwtTokenProvider.getUserId(token);
                    Optional<User> sender = userRepository.findByUsername(senderId);
                    if (!sender.isPresent()) {
                        deleteUserSession(session);
                        System.out.println("can not find user");
                        return;
                    }

                    String sendTImeStr = payload.getString("time");
                    Date sendTime = DT.parse(sendTImeStr);

                    Chat chat = Chat.builder()
                            .roomInfo(chatRoom.get())
                            .sender(sender.get())
                            .sendTime(sendTime)
                            .chat(payload.getString("msg"))
                            .build();
                    long chatId = chatRepository.save(chat).getId();

                    JSONObject resultMsg = new JSONObject();
                    resultMsg.put("type", "Chat");
                    resultMsg.put("id", chatId);
                    resultMsg.put("senderId", senderId);
                    resultMsg.put("profile", "");
                    resultMsg.put("sender", sender.get().getNickname());
                    resultMsg.put("sendTime", sendTImeStr);
                    resultMsg.put("msg", payload.getString("msg"));
                    TextMessage msg = new TextMessage(resultMsg.toString().getBytes());

                    broadCastMsg(roomId, msg);
                    break;
                }
                case "Member": {
                    String token = payload.getString("token");
                    if (!jwtTokenProvider.validateToken(token)) {
                        deleteUserSession(session);
                        System.out.println("Token is not validate");
                        return;
                    }

                    String roomId = payload.getString("room");
                    List<String> meberList = roomMemberMap.getOrDefault(roomId, null);
                    List<Member> memberInfoList = new ArrayList<>();

                    if (meberList != null) {
                        for (String memberId : meberList) {
                            UserInfo meberInfo = userMap.get(memberId);

                            memberInfoList.add(meberInfo.toDTO());
                        }
                    }

                    JSONObject resultMsg = new JSONObject();
                    resultMsg.put("type", "Member");
                    resultMsg.put("members", memberInfoList);
                    TextMessage msg = new TextMessage(resultMsg.toString().getBytes());
                    session.sendMessage(msg);
                }
                /*
                case "RTC": {

                    break;
                }
                case "Meta": {

                    break;
                }
                 */
            }
        } catch (Exception ex) {
            System.out.println("handleTextMessage" + ex.getMessage());
        }
    }

    private void broadCastMsg(String roomId, TextMessage msg) throws IOException {
        for (String memberId : roomMemberMap.get(roomId)) {
            UserInfo memberInfo = userMap.getOrDefault(memberId, null);
            if (memberInfo == null) continue;

            memberInfo.getSession().sendMessage(msg);
        }
    }

    private void deleteUserSession(WebSocketSession session) throws IOException {
        String deletId = null;
        for (String userId : userMap.keySet()) {
            UserInfo userInfo = userMap.get(userId);

            String roomId = userInfo.getRoomId();
            if (roomId != null) {
                roomMemberMap.get(roomId).remove(userId);
            }

            if (userInfo.getSession().equals(session)) {
                session.close();
                deletId = userId;
                break;
            }
        }
        if (deletId != null)
            userMap.remove(deletId);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        deleteUserSession(session);
    }
}
