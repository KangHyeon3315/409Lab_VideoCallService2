package com.lab409.backend.entity;

import lombok.Getter;

import javax.persistence.*;

@Entity(name = "friends")
@Getter
public class Friends {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 30)
    private String userid;

    @ManyToOne
    @JoinColumn(name="friendid")
    private User friendsInfo;

    @ManyToOne
    @JoinColumn(name="join_id")
    private ChatJoin chatJoin;
}
