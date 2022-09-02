package com.lab409.backend.repository;

import com.lab409.backend.entity.Friends;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendsRepository extends JpaRepository<Friends, Long> {
    List<Friends> findAllByUserid(String userid);
}
