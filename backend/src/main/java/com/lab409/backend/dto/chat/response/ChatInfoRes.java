package com.lab409.backend.dto.chat.response;

import com.lab409.backend.dto.chat.info.ChatInfo;
import com.lab409.backend.dto.chat.info.Member;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@RequiredArgsConstructor
public class ChatInfoRes {
    private final boolean result;
    private final String msg;
    private final String title;
    private final List<ChatInfo> chatList;
    private final List<Member> members;
}
