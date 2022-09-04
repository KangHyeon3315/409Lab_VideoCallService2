package com.lab409.backend.service;

import com.lab409.backend.dto.user.info.FriendsInfo;
import com.lab409.backend.dto.user.info.RoomInfo;
import com.lab409.backend.dto.common.response.DefaultRes;
import com.lab409.backend.dto.user.response.UserInfoRes;
import com.lab409.backend.entity.ChatJoin;
import com.lab409.backend.entity.ChatRoom;
import com.lab409.backend.entity.Friends;
import com.lab409.backend.entity.User;
import com.lab409.backend.repository.ChatJoinRepository;
import com.lab409.backend.repository.FriendsRepository;
import com.lab409.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final FriendsRepository friendsRepository;
    private final ChatJoinRepository chatJoinRepository;

    public UserInfoRes getUserInfo(String username) {
        Optional<User> user = userRepository.findByUsername(username);

        if (!user.isPresent()) {
            return new UserInfoRes(false, null, null);
        }

        List<FriendsInfo> friendsList = new ArrayList<>();
        for(Friends friendsInfo : friendsRepository.findAllByUserid(username)) {
            FriendsInfo info = new FriendsInfo(friendsInfo);

            friendsList.add(info);
        }

        List<RoomInfo> roomList = new ArrayList<>();
        for(ChatJoin chatJoin : chatJoinRepository.findAllByUser(user.get())) {
            ChatRoom room = chatJoin.getRoomInfo();
            roomList.add(new RoomInfo(room));
        }
        return new UserInfoRes(true, friendsList, roomList);
    }

    public DefaultRes addFriends(String userId, String friendId) {
        Optional<User> friendInfo = userRepository.findByUsername(friendId);
        if(userRepository.countByUsername(userId) == 0) {
            return new DefaultRes(false, "로그인을 먼저 하세요.");
        }
        if(!friendInfo.isPresent()) {
            return new DefaultRes(false, "해당 사용자를 찾을 수 없습니다.");
        }

        if(friendsRepository.countByUseridAndFriendsInfo(userId, friendInfo.get()) != 0) {
            return new DefaultRes(false, "이미 친구 추가 되었습니다.");
        }


        Friends friends = Friends.builder()
                .userid(userId)
                .friendsInfo(friendInfo.get())
                .build();

        friendsRepository.save(friends);
        return new DefaultRes(true, null);
    }

    public DefaultRes deleteFriends(String userId, String friendsId) {
        Optional<User> friendInfo = userRepository.findByUsername(friendsId);

        if(!friendInfo.isPresent()) {
            return new DefaultRes(false, "해당 사용자를 찾을 수 없습니다.");
        }

        Optional<Friends> friends = friendsRepository.findByUseridAndFriendsInfo(userId, friendInfo.get());
        if(!friends.isPresent()) {
            return new DefaultRes(false, "해당 사용자와 친구가 아닙니다.");
        }

        friendsRepository.delete(friends.get());
        return new DefaultRes(true, null);
    }


}
