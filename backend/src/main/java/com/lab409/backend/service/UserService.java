package com.lab409.backend.service;

import com.lab409.backend.dto.user.parameter.UserDTO;
import com.lab409.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional
    public Long save(UserDTO userDTO) {
        return userRepository.save(userDTO.toEntity()).getId();
    }


}
