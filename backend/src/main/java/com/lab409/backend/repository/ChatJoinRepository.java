package com.lab409.backend.repository;

import com.lab409.backend.entity.ChatJoin;
import com.lab409.backend.entity.ChatRoom;
import com.lab409.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatJoinRepository extends JpaRepository<ChatJoin, Long> {
    List<ChatJoin>  findAllByUser(User user);
    Optional<ChatJoin> findByUserAndRoomInfo(User user, ChatRoom chatRoom);

    int countByRoomInfo(ChatRoom chatRoom);
}
