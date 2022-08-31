package com.lab409.backend.dto.user.response;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class SigninRes {
    private final boolean result;
    private final String msg;
    private final String token;
}
