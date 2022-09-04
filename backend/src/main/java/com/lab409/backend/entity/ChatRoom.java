package com.lab409.backend.entity;

import lombok.*;

import javax.persistence.*;

@Getter
@Builder
@Entity(name="chat_room")
@RequiredArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    @Id
    private String id;

    @Column(nullable = false, length = 40)
    private String title;
}
