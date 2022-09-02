package com.lab409.backend.dto.user.response;

import com.lab409.backend.dto.user.info.FriendsInfo;
import com.lab409.backend.dto.user.info.RoomInfo;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@RequiredArgsConstructor
public class UserInfoRes {
    private final boolean result;
    private final List<FriendsInfo> friendsList;
    private final List<RoomInfo> roomList;

}
