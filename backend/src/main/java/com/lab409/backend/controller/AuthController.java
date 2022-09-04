package com.lab409.backend.controller;

import com.lab409.backend.config.JwtTokenProvider;
import com.lab409.backend.dto.user.parameter.UserDTO;
import com.lab409.backend.dto.user.response.SigninRes;
import com.lab409.backend.dto.user.response.SignupRes;
import com.lab409.backend.entity.User;
import com.lab409.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    // 회원가입
    @PostMapping("/signup")
    public SignupRes join(UserDTO userDTO) {
        // TODO 검사하는 기능 구현하기 (유효성 검증 (공백 및 일부 특수문자 금지))
        if (userRepository.countByUsername(userDTO.getUsername()) != 0) {
            return new SignupRes(false, "중복되는 아이디 입니다.");
        }

        userDTO.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        userRepository.save(userDTO.toEntity());

        return new SignupRes(true, "");
    }

    // 로그인
    @PostMapping("/signin")
    public SigninRes signin(String username, String password) {
        Optional<User> userOptional = userRepository.findByUsername(username);

        if(!userOptional.isPresent()) {
            return new SigninRes(false, "가입되지 않은 계정입니다.", null);
        }
        User user = userOptional.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return new SigninRes(false, "잘못된 비밀번호입니다.", null);
        }

        List<String> roles = new ArrayList<>();
        roles.add(user.getRole().getKey());

        String token = jwtTokenProvider.createToken(user.getUsername(), roles);

        return new SigninRes(true, null, token);
    }
}
