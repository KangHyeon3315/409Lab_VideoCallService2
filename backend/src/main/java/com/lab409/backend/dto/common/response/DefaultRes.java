package com.lab409.backend.dto.common.response;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class DefaultRes {
    private final boolean result;
    private final String msg;
}
