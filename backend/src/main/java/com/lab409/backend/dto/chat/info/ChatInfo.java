package com.lab409.backend.dto.chat.info;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Date;

@Getter
@RequiredArgsConstructor
public class ChatInfo {
    private final long id;
    private final String type;
    private final String senderId;
    private final String sender;
    private final String sendTime;
    private final String msg;
}
