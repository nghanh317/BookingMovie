package com.example.controller.ChatBotAI;

import com.example.service.ChatBotAI.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
public class AIController {

    @Autowired
    private AIService aiService;

    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody Map<String, String> payload) {
        String prompt = payload.get("prompt");
        if (prompt == null || prompt.isEmpty()) {
            return Collections.singletonMap("response", "Vui lòng nhập câu hỏi.");
        }
        String response = aiService.askGemini(prompt);
        return Collections.singletonMap("response", response);
    }
}
