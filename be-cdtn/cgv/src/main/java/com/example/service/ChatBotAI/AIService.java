package com.example.service.ChatBotAI;

import java.util.List;

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

	public String askGemini(String prompt) {
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
					+ "Hãy trả lời một cách thân thiện, chuyên nghiệp và ngắn gọn.\n\n" + contextBuilder.toString();

			// Define system instruction
			Content systemInstruction = Content.fromParts(Part.fromText(systemInstructionText));

			// Configure the request
			GenerateContentConfig config = GenerateContentConfig.builder().systemInstruction(systemInstruction).build();

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
