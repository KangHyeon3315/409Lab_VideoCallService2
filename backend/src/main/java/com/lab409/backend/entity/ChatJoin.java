package com.lab409.backend.entity;

import lombok.Getter;

import javax.persistence.*;

@Entity(name = "chat_join")
@Getter
public class ChatJoin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 30)
    private String userId;

    @ManyToOne
    @JoinColumn(name="chat_id")
    private ChatRoom roomInfo;
}
