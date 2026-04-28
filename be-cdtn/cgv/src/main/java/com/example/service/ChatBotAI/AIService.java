package com.example.service.ChatBotAI;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class AIService {

    @Value("${google.ai.api-key}")
    private String apiKey;

    private Client client;

    @PostConstruct
    public void init() {
        this.client = Client.builder()
                .apiKey(apiKey)
                .build();
    }

    public String askGemini(String prompt) {
        try {
            // Define system instruction
            Content systemInstruction = Content.fromParts(
                    Part.fromText("Bạn là trợ lý ảo thông minh của rạp chiếu phim CGV. " +
                            "Nhiệm vụ của bạn là hỗ trợ khách hàng tìm kiếm phim, lịch chiếu, giá vé và giải đáp các thắc mắc về dịch vụ của CGV. "
                            +
                            "Hãy trả lời một cách thân thiện, chuyên nghiệp và ngắn gọn."));

            // Configure the request
            GenerateContentConfig config = GenerateContentConfig.builder()
                    .systemInstruction(systemInstruction)
                    .build();

            // Using gemini-1.5-flash for fast responses
            GenerateContentResponse response = client.models.generateContent("gemini-robotics-er-1.6-preview", prompt,
                    config);
            return response.text();
        } catch (Exception e) {
            e.printStackTrace();
            return "Xin lỗi, đã có lỗi xảy ra khi kết nối với AI: " + e.getMessage();
        }
    }
}
