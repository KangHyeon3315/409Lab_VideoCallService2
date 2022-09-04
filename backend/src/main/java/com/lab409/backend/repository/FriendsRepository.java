package com.lab409.backend.repository;

import com.lab409.backend.entity.Friends;
import com.lab409.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FriendsRepository extends JpaRepository<Friends, Long> {
    List<Friends> findAllByUserid(String userid);

    int countByUseridAndFriendsInfo(String userid, User friendsInfo);

    Optional<Friends> findByUseridAndFriendsInfo(String userid, User friendsInfo);
}
