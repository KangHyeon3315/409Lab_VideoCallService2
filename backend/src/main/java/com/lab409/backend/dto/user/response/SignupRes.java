package com.lab409.backend.dto.user.response;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class SignupRes {
    private final boolean result;
    private final String msg;
}
