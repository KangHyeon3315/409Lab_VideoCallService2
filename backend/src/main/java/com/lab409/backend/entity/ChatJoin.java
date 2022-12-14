package com.lab409.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import javax.persistence.*;

@Entity(name = "chat_join")
@Getter
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class ChatJoin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name="chat_id")
    private ChatRoom roomInfo;
}
