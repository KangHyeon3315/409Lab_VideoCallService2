package com.lab409.backend.controller;

import com.lab409.backend.config.JwtTokenProvider;
import com.lab409.backend.entity.Chat;
import com.lab409.backend.entity.ChatRoom;
import com.lab409.backend.entity.User;
import com.lab409.backend.repository.ChatRepository;
import com.lab409.backend.repository.ChatRoomRepository;
import com.lab409.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.text.SimpleDateFormat;
import java.util.*;

@Component
@RequiredArgsConstructor
public class ChatHandler extends TextWebSocketHandler {
    private static final HashMap<String, WebSocketSession> sessionMap = new HashMap<>();
    private static final HashMap<String, List<String>> meetroomMap = new HashMap<>();
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
                        session.close();
                        System.out.println("Token is not validate");
                        return;
                    }
                    String userId = jwtTokenProvider.getUserId(token);

                    sessionMap.put(userId, session);
                    break;
                }
                case "Chat": {
                    String token = payload.getString("token");
                    if (!jwtTokenProvider.validateToken(token)) {
                        deleteUserSession(session);
                        session.close();
                        System.out.println("Token is not validate");
                        return;
                    }
                    String roomId = payload.getString("room");
                    Optional<ChatRoom> chatRoom = chatRoomRepository.findById(roomId);
                    if (!chatRoom.isPresent()) {
                        deleteUserSession(session);
                        session.close();
                        System.out.println("can not find room");
                        return;
                    }
                    String senderId = jwtTokenProvider.getUserId(token);
                    Optional<User> sender = userRepository.findByUsername(senderId);
                    if (!sender.isPresent()) {
                        deleteUserSession(session);
                        session.close();
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

                    // session.sendMessage(msg);

                    JSONArray userList = payload.getJSONArray("users");
                    for (int i = 0; i < userList.length(); i++) {
                        String userId = userList.getString(i);

                        if (sessionMap.containsKey(userId)) {
                            sessionMap.get(userId).sendMessage(msg);
                        }
                    }
                    break;
                }
                case "Meta": {

                    break;
                }
            }
        } catch (Exception ex) {
            System.out.println("handleTextMessage" + ex.getMessage());
        }
    }

    private void deleteUserSession(WebSocketSession session) {
        for (String key : sessionMap.keySet()) {
            if (sessionMap.get(key).equals(session) && sessionMap.get(key) != null) {
                sessionMap.remove(key);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        deleteUserSession(session);
    }
}
