package com.lab409.backend.repository;

import com.lab409.backend.dto.user.info.RoomInfo;
import com.lab409.backend.entity.Chat;
import com.lab409.backend.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    void deleteAllByRoomInfo(ChatRoom room);

    // List<Chat> findTop100ByRoomInfoOrderBySendTimeAsc(ChatRoom roomInfo);
    List<Chat> findTop100ByRoomInfoOrderBySendTimeDesc(ChatRoom roomInfo);
}
