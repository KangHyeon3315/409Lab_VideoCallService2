package com.lab409.backend.controller;

import com.lab409.backend.dto.user.response.UserInfoRes;
import com.lab409.backend.entity.Friends;
import com.lab409.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/info")
    public UserInfoRes getFriends(@RequestParam(name = "username") String username) {
        return userService.getUserInfo(username);
    }
}
