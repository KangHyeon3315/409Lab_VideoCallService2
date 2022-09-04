package com.lab409.backend.repository;

import com.lab409.backend.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {

    int countById(String id);
}
