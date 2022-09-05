package com.lab409.backend.dto.chat.info;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class Member {
    private final String userId;
    private final String name;
}
