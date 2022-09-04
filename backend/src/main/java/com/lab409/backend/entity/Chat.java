package com.lab409.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import javax.persistence.*;
import java.util.Date;

@Entity(name = "chat")
@Getter
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name="room_id")
    private ChatRoom roomInfo;

    @Column(nullable = false, length = 1024)
    private String chat;

    @ManyToOne
    @JoinColumn(name="sender_id")
    private User sender;

    @Column(nullable = false)
    private Date sendTime;
}
