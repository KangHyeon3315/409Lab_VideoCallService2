package com.lab409.backend.dto.user.info;

import com.lab409.backend.entity.ChatJoin;
import com.lab409.backend.entity.Friends;
import com.lab409.backend.entity.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class FriendsInfo {
    private final long id;
    private final String nickname;
    private final String email;
    private final long chatId;
    public FriendsInfo(Friends friends) {
        User userInfo =  friends.getFriendsInfo();

        id = userInfo.getId();
        nickname = userInfo.getNickname();
        email = userInfo.getEmail();

        ChatJoin chatInfo = friends.getChatJoin();
        chatId = chatInfo.getRoomInfo().getId();
    }

}
