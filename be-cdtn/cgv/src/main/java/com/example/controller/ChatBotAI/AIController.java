package com.example.controller.ChatBotAI;

import java.util.Collections;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.service.ChatBotAI.AIService;

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
