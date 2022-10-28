package com.lab409.backend.controller;

import com.lab409.backend.dto.chat.response.ChatInfoRes;
import com.lab409.backend.dto.common.response.DefaultRes;
import com.lab409.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final ChatHandler chatHandler;

    @PostMapping("/join")
    public DefaultRes createChatRoom(String title, @RequestParam(name = "userIds[]") String[] userIds) {
        return chatService.createChatRoom(title, userIds);

    }

    @DeleteMapping("/exit")
    public DefaultRes exitChatRoom(String chatId, String userId) {
        return chatService.exitChatRoom(chatId, userId);
    }

    @PostMapping("/invite")
    public DefaultRes inviteChatRoom(String chatId, @RequestParam(name = "userIds[]") String[] userIds) {
        return chatService.inviteChatRoom(chatId, userIds);
    }

    @GetMapping("/info")
    public ChatInfoRes getChatInfo(String chatId, String userId) {
        return chatService.getChatInfo(chatId, userId);
    }

    @PostMapping("/file")
    public DefaultRes uploadFiles(MultipartFile[] files, String roomId, String userId) { // 파라미터의 이름은 client의 formData key값과 동일해야함
        String UPLOAD_PATH = "/Users/kh/Documents/Project409"; // 업로드 할 위치

        try {

            List<String> fileNames = new ArrayList<>();
            List<String> originFileNames = new ArrayList<>();
            for (MultipartFile file : files) {
                // 현재 날짜와 랜덤 정수값으로 새로운 파일명 만들기
                String fileId = String.format("%d-%s", new Date().getTime(), UUID.randomUUID());

                String originName = file.getOriginalFilename(); // 파일 이름 추출 (image.jpg)
                if (originName == null) return new DefaultRes(false, "파일 업로드를 실패했습니다.");
                String fileExtension = originName.substring(originName.lastIndexOf(".") + 1); // 파일 확장자 추출
                // originName = originName.substring(0, originName.lastIndexOf(".")); // 확장자를 제거한 파일 이름 추출

                long fileSize = file.getSize(); // 파일 사이즈

                String fileName = fileId + "." + fileExtension;
                File fileSave = new File(UPLOAD_PATH, fileName); // 새로운 파일명.확장자로 파일 생성

                file.transferTo(fileSave); // fileSave의 형태로 파일 저장

                fileNames.add(fileName);
                originFileNames.add(originName);

            }
            chatHandler.processFileUpload(roomId, userId, originFileNames, fileNames);
        } catch (Exception e) {
            e.printStackTrace();
            return new DefaultRes(false, "파일 업로드를 실패했습니다.");
        }

        return new DefaultRes(true, null);
    }

    @GetMapping("/file")
    public ResponseEntity<Object> download(String fileId, String name) {
        String UPLOAD_PATH = "/Users/kh/Documents/Project409"; // 업로드 할 위치
        String PATH = UPLOAD_PATH + "/" + fileId;

        try {
            Path filePath = Paths.get(PATH);
            Resource resource = new InputStreamResource(Files.newInputStream(filePath)); // 파일 resource 얻기

            HttpHeaders headers = new HttpHeaders();
            // 다운로드 되거나 로컬에 저장되는 용도로 쓰이는지를 알려주는 헤더
            headers.setContentDisposition(ContentDisposition.builder("attachment").filename(name, StandardCharsets.UTF_8).build());

            return new ResponseEntity<>(resource, headers, HttpStatus.OK);
        } catch(Exception e) {
            return new ResponseEntity<>(null, HttpStatus.CONFLICT);
        }
    }
}
