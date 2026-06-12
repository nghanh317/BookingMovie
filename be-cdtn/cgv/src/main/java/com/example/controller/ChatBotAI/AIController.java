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
	public Map<String, Object> chat(@RequestBody Map<String, Object> payload) {
		String prompt = (String) payload.get("prompt");
		@SuppressWarnings("unchecked")
		java.util.List<Map<String, String>> history = (java.util.List<Map<String, String>>) payload.get("history");
		
		if (prompt == null || prompt.isEmpty()) {
			return Collections.<String, Object>singletonMap("response", "Vui lòng nhập câu hỏi.");
		}
		return aiService.askGemini(prompt, history);
	}
}
