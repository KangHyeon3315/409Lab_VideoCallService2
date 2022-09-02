package com.lab409.backend.entity;

import lombok.Getter;

import javax.persistence.*;

@Getter
@Entity(name="chat_room")
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 40)
    private String title;
}
