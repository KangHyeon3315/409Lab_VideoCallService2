package com.lab409.backend.controller;

import com.lab409.backend.dto.common.response.DefaultRes;
import com.lab409.backend.dto.user.response.UserInfoRes;
import com.lab409.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/info")
    public UserInfoRes getFriends(@RequestParam(name = "username") String username) {
        return userService.getUserInfo(username);
    }

    @PostMapping("/friend")
    public DefaultRes addFriend(String userId, String friendId) {
        return userService.addFriends(userId, friendId);
    }

    @DeleteMapping("/friend")
    public DefaultRes deleteFriend(String userId, String friendId) {
        return userService.deleteFriends(userId, friendId);
    }
}
