package com.lab409.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity(name = "friends")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
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
