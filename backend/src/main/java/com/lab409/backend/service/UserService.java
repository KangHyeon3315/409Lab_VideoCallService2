package com.lab409.backend.service;

import com.lab409.backend.dto.user.info.FriendsInfo;
import com.lab409.backend.dto.user.info.RoomInfo;
import com.lab409.backend.dto.user.response.UserInfoRes;
import com.lab409.backend.entity.ChatJoin;
import com.lab409.backend.entity.ChatRoom;
import com.lab409.backend.entity.Friends;
import com.lab409.backend.repository.ChatJoinRepository;
import com.lab409.backend.repository.FriendsRepository;
import com.lab409.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final FriendsRepository friendsRepository;
    private final ChatJoinRepository chatJoinRepository;

    public UserInfoRes getUserInfo(String username) {
        if(userRepository.countByUsername(username) == 0) {
            return new UserInfoRes(false, null, null);
        }

        List<FriendsInfo> friendsList = new ArrayList<>();
        for(Friends friendsInfo : friendsRepository.findAllByUserid(username)) {
            FriendsInfo info = new FriendsInfo(friendsInfo);

            friendsList.add(info);
        }

        List<RoomInfo> roomList = new ArrayList<>();
        for(ChatJoin chatJoin : chatJoinRepository.findAllByUserId(username)) {
            ChatRoom room = chatJoin.getRoomInfo();
            roomList.add(new RoomInfo(room));
        }
        return new UserInfoRes(true, friendsList, roomList);
    }



}
