package com.example.service.ChatBotAI;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.entity.Movies;
import com.example.entity.SettingSystem;
import com.example.entity.Slots;
import com.example.repository.MovieRepository;
import com.example.repository.SlotRepository;
import com.example.service.SettingSystem.PricingService;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;

import jakarta.annotation.PostConstruct;

@Service
public class AIService {

	@Value("${google.ai.api-key}")
	private String apiKey;

	private Client client;

	@Autowired
	private MovieRepository movieRepository;

	@Autowired
	private SlotRepository slotRepository;

	@Autowired
	private PricingService pricingService;

	@PostConstruct
	public void init() {
		this.client = Client.builder().apiKey(apiKey).build();
	}

	public Map<String, Object> askGemini(String prompt, List<Map<String, String>> history) {
		try {
			StringBuilder contextBuilder = new StringBuilder();
			contextBuilder
					.append("Dưới đây là thông tin hiện tại từ hệ thống để bạn tham khảo khi trả lời khách hàng:\n");

			// 1. Phim
			contextBuilder.append("- Danh sách phim:\n");
			List<Movies> movies = movieRepository.findAll();
			for (Movies movie : movies) {
				if (!Boolean.TRUE.equals(movie.getIsDeleted())) {
					String statusStr = movie.getStatus() != null ? movie.getStatus().getValue() : "Chưa xác định";
					contextBuilder.append(String.format("  + %s (Thời lượng: %d phút, Thể loại: %s, Trạng thái: %s)\n",
							movie.getTitle(), movie.getDuration(), movie.getGenre(), statusStr));
				}
			}

			// 2. Lịch chiếu (Slots)
			contextBuilder.append("- Lịch chiếu phim:\n");
			List<Slots> slots = slotRepository.findAll();
			for (Slots slot : slots) {
				if (!Boolean.TRUE.equals(slot.getIsDeleted()) && slot.getMovies() != null && slot.getRooms() != null
						&& slot.getRooms().getCinemas() != null) {
					contextBuilder.append(String.format("  + Phim: %s | Rạp: %s - %s | Lịch chiếu: %s\n",
							slot.getMovies().getTitle(), slot.getRooms().getCinemas().getCinemaName(),
							slot.getRooms().getRoomName(), slot.getShowTime()));
				}
			}

			// 3. Giá vé
			try {
				SettingSystem priceConfig = pricingService.getPriceConfig();
				contextBuilder.append("- Cấu hình giá vé: ").append(priceConfig.getConfigData()).append("\n");
			} catch (Exception e) {
				contextBuilder.append("- Không thể lấy cấu hình giá vé hiện tại.\n");
			}

			String systemInstructionText = "Bạn là trợ lý ảo thông minh của rạp chiếu phim CGV. "
					+ "Nhiệm vụ của bạn là hỗ trợ khách hàng tìm kiếm phim, lịch chiếu, giá vé và giải đáp các thắc mắc về dịch vụ của CGV. "
					+ "Bạn PHẢI LUÔN LUÔN trả lời dưới định dạng JSON (không dùng markdown code block, chỉ trả về JSON thô). Cấu trúc bắt buộc:\n"
					+ "{\n"
					+ "  \"response\": \"câu trả lời bằng văn bản của bạn\",\n"
					+ "  \"movieIds\": [danh sách các ID phim (số nguyên) được nhắc đến hoặc gợi ý, ví dụ: 1, 2. Nếu không có thì để rỗng []],\n"
					+ "  \"slotIds\": [danh sách các ID suất chiếu (số nguyên) được nhắc đến hoặc gợi ý, ví dụ: 10, 15. Nếu không có thì để rỗng []]\n"
					+ "}\n\n"
					+ "Nếu khách hàng hỏi những câu không liên quan đến rạp phim hoặc nằm ngoài database, hãy phản hồi lịch sự.\n\n" 
					+ contextBuilder.toString();

			// Define system instruction
			Content systemInstruction = Content.fromParts(Part.fromText(systemInstructionText));

			// Configure the request
			GenerateContentConfig config = GenerateContentConfig.builder()
                    .systemInstruction(systemInstruction)
                    .responseMimeType("application/json")
                    .build();

			// Prepare conversation history
			List<Content> contents = new ArrayList<>();
			if (history != null) {
				for (Map<String, String> msg : history) {
					String role = msg.get("role");
					String text = msg.get("text");
					if (text != null && !text.isEmpty() && role != null) {
						contents.add(Content.builder()
								.role(role)
								.parts(Collections.singletonList(Part.fromText(text)))
								.build());
					}
				}
			}
			// Add the current prompt
			contents.add(Content.builder()
					.role("user")
					.parts(Collections.singletonList(Part.fromText(prompt)))
					.build());

			// Using gemini-1.5-flash for fast responses
			GenerateContentResponse response = client.models.generateContent("gemini-1.5-flash", contents, config);
			String responseText = response.text();
			
			com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
			try {
			    return mapper.readValue(responseText, Map.class);
			} catch (Exception parseEx) {
			    Map<String, Object> fallback = new java.util.HashMap<>();
			    fallback.put("response", responseText);
			    return fallback;
			}
		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> err = new java.util.HashMap<>();
			err.put("response", "Xin lỗi, đã có lỗi xảy ra khi kết nối với AI: " + e.getMessage());
			return err;
		}
	}
}
