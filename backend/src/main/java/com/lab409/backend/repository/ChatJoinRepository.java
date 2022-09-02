package com.lab409.backend.repository;

import com.lab409.backend.entity.ChatJoin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatJoinRepository extends JpaRepository<ChatJoin, Long> {
    List<ChatJoin>  findAllByUserId(String username);
}
