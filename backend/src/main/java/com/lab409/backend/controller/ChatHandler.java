package com.lab409.backend.controller;

import com.lab409.backend.config.JwtTokenProvider;
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

    private static final HashMap<String, UserInfo> userMap = new HashMap<>();
    private static final HashMap<String, List<String>> roomMemberMap = new HashMap<>(); // Key : RoomId, Value : Member Id List

    private static final SimpleDateFormat DT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    private final JwtTokenProvider jwtTokenProvider;
    private final ChatRepository chatRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;

    /**
     * 해당 세션을 가지고 있는 User를 찾아 반환
     */
    private UserInfo findUserInfoBySession(WebSocketSession session) {
        for (String userId : userMap.keySet()) {
            UserInfo user = userMap.get(userId);
            if (user.getSession().equals(session)) {
                return user;
            }
        }
        return null;
    }

    /**
     * Room을 Exit
     */
    private void exitRoom(UserInfo userInfo) throws Exception {
        String roomId = userInfo.getRoomId();

        System.out.println("Exit User + " + roomId);

        if (roomId != null) {
            JSONObject resultMsg = new JSONObject();
            resultMsg.put("type", "Exited");
            resultMsg.put("userId", userInfo.getUserId());
            resultMsg.put("roomId", roomId);
            TextMessage msg = new TextMessage(resultMsg.toString().getBytes());

            broadCastMsg(roomId, msg, userInfo.getUserId());

            List<String> memberList = roomMemberMap.get(roomId);
            memberList.remove(userInfo.getUserId());
            roomMemberMap.put(roomId, memberList);
        }
        userInfo.setRoomId(null);
    }

    private void addRoom(UserInfo userInfo, String roomId) {
        String userId = userInfo.getUserId();
        userInfo.setRoomId(roomId);

        List<String> memberList = roomMemberMap.getOrDefault(roomId, null);

        if (memberList == null) memberList = new ArrayList<>();
        if (!memberList.contains(userId)) memberList.add(userId);

        roomMemberMap.put(roomId, memberList);

    }

    /**
     * 유저 세션을 제거하는 기능
     */
    private void deleteUserSession(WebSocketSession session) throws Exception {
        UserInfo userInfo = findUserInfoBySession(session);
        if (userInfo == null) {
            session.close();
            return;
        }

        exitRoom(userInfo);

        session.close();

        String userId = userInfo.getUserId();
        userMap.remove(userId);
    }

    /**
     * 사용자가 처음 접속했을 때 User 객체를 생성
     */
    private void processJoin(WebSocketSession session, JSONObject payload) throws Exception {
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
    }

    /**
     * 사용자가 Room에 접속 한 경우
     */
    private void processEnter(WebSocketSession session, JSONObject payload) throws Exception {
        UserInfo userInfo = findUserInfoBySession(session);
        if (userInfo == null) return;

        String roomId = payload.getString("roomId");

        exitRoom(userInfo);
        addRoom(userInfo, roomId);

        userInfo.setStreamId(payload.getString("streamId"));

        JSONObject resultMsg = new JSONObject();
        resultMsg.put("type", "Entered");
        resultMsg.put("userId", userInfo.getUserId());
        resultMsg.put("streamId", userInfo.getStreamId());
        resultMsg.put("msg", "Someone Entered");
        TextMessage msg = new TextMessage(resultMsg.toString().getBytes());
        broadCastMsg(roomId, msg, userInfo.getUserId());

        JSONObject streamMap = new JSONObject();
        for (String id : roomMemberMap.get(roomId)) {
            UserInfo info = userMap.get(id);
            String streamId = info.getStreamId();
            streamMap.put(id, streamId);
        }

        JSONObject responseMsg = new JSONObject();
        responseMsg.put("type", "EnterRes");
        responseMsg.put("streamInfo", streamMap);
        TextMessage response = new TextMessage(responseMsg.toString().getBytes());
        synchronized (session) {
            session.sendMessage(response);
        }
    }

    /**
     * Ice 요청 처리
     */
    private void processIce(WebSocketSession session, JSONObject payload) throws Exception {
        if (!payload.has("ice") || payload.isNull("ice")) return;

        UserInfo userInfo = findUserInfoBySession(session);
        if (userInfo == null) return;

        String roomId = userInfo.getRoomId();
        if (roomId == null) {
            System.out.println("Process Ice : Room Id is null");
            return;
        }

        JSONObject resultMsg = new JSONObject();
        resultMsg.put("type", "Ice");
        resultMsg.put("userId", userInfo.getUserId());
        resultMsg.put("ice", payload.getJSONObject("ice"));
        TextMessage msg = new TextMessage(resultMsg.toString().getBytes());

        broadCastMsg(roomId, msg, userInfo.getUserId());
    }

    /**
     * Offer나 Answer에 대한 처리
     */
    private void processOfferAnswer(WebSocketSession session, JSONObject payload) throws Exception {
        UserInfo userInfo = findUserInfoBySession(session);
        if (userInfo == null) return;
        String roomId = userInfo.getRoomId();

        if (roomId == null) {
            System.out.println("processOfferAnswer Not Found Room Id");
            return;
        }

        List<String> memberList = roomMemberMap.get(roomId);
        String targetId = payload.getString("target");

        if (!memberList.contains(userInfo.getUserId()) || !memberList.contains(targetId)) {
            System.out.println("processOfferAnswer Not Equal Room");
        }

        UserInfo targetInfo = userMap.get(targetId);

        String type = payload.getString("type");

        JSONObject resultMsg = new JSONObject();
        resultMsg.put("type", type);
        resultMsg.put("userId", userInfo.getUserId());
        resultMsg.put("targetId", targetInfo.getUserId());

        if (type.equals("Offer")) {
            resultMsg.put("offer", payload.getJSONObject("offer"));
        } else if (type.equals("Answer")) {
            resultMsg.put("answer", payload.getJSONObject("answer"));
        } else {
            throw new Exception("Unknown Type");
        }

        TextMessage msg = new TextMessage(resultMsg.toString().getBytes());

        WebSocketSession targetSession = targetInfo.getSession();
        synchronized (targetSession) {
            targetSession.sendMessage(msg);
        }

    }

    /**
     * 채팅 전송에 대한 처리
     */
    private void processChat(WebSocketSession session, JSONObject payload) throws Exception {
        UserInfo userInfo = findUserInfoBySession(session);
        if (userInfo == null) return;

        String roomId = userInfo.getRoomId();
        Optional<ChatRoom> chatRoom = chatRoomRepository.findById(roomId);
        if (!chatRoom.isPresent()) {
            deleteUserSession(session);
            System.out.println("processChat can not find room");
            return;
        }

        String senderId = userInfo.getUserId();
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
        resultMsg.put("roomId", roomId);
        resultMsg.put("senderId", senderId);
        resultMsg.put("profile", "");
        resultMsg.put("sender", sender.get().getNickname());
        resultMsg.put("sendTime", sendTImeStr);
        resultMsg.put("msg", payload.getString("msg"));
        TextMessage msg = new TextMessage(resultMsg.toString().getBytes());
        broadCastMsg(roomId, msg);
    }


    /**
     * Room Exit에 대한 처리 기능 구현
     */
    private void processExit(WebSocketSession session) throws Exception {
        UserInfo user = findUserInfoBySession(session);
        if (user == null) return;

        exitRoom(user);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            JSONObject payload = new JSONObject(message.getPayload());
            if (!payload.has("type")) return;

            switch (payload.getString("type")) {
                case "Join":
                    processJoin(session, payload);
                    break;
                case "Enter":  // 채팅방 접속할 때 사용
                    processEnter(session, payload);
                    break;
                case "Chat":
                    processChat(session, payload);
                    break;
                case "Offer":
                case "Answer":
                    processOfferAnswer(session, payload);
                    break;
                case "Ice":
                    processIce(session, payload);
                    break;
                case "Exit":
                    processExit(session);
                default:
                    System.out.println("Unknown Type : " + payload.get("type"));
                    break;
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            System.out.println("handleTextMessage : " + ex.getMessage());
        }
    }

    private void broadCastMsg(String roomId, TextMessage msg) throws IOException {
        broadCastMsg(roomId, msg, "");
    }

    private void broadCastMsg(String roomId, TextMessage msg, String ExcludeId) throws IOException {
        if (roomMemberMap.get(roomId) == null) return;

        for (String memberId : roomMemberMap.get(roomId)) {
            if (memberId.equals(ExcludeId)) continue;

            UserInfo memberInfo = userMap.getOrDefault(memberId, null);
            if (memberInfo == null) continue;

            WebSocketSession targetSession = memberInfo.getSession();
            synchronized (targetSession) {
                targetSession.sendMessage(msg);
            }

        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        deleteUserSession(session);
    }
}
