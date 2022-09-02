package com.lab409.backend.dto.user.info;

import com.lab409.backend.entity.ChatJoin;
import com.lab409.backend.entity.ChatRoom;
import lombok.Getter;

@Getter
public class RoomInfo {
    private final long chatId;
    private final String title;

    public RoomInfo(ChatRoom room) {
        chatId = room.getId();
        title = room.getTitle();
    }
}
