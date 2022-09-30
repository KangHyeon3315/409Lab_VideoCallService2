package com.lab409.backend.dto.chat.info;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.socket.WebSocketSession;

@Getter
@Setter
public class UserInfo {
    private String token;
    private String userId;
    private String userName;

    private String roomId; // 현재 접속중인 채팅방 정보
    private String streamId;

    private WebSocketSession session;

    public UserInfo(String token, String userId, String userName, WebSocketSession session) {
        this.token = token;
        this.userId = userId;
        this.userName = userName;

        this.roomId = null;
        this.session = session;
    }

    public Member toDTO() {
        return new Member(userId, userName);
    }

    public void setStreamId(String id) {
        this.streamId = id;
    }
}
