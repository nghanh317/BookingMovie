package com.example.service.SettingSystem;

import java.math.BigDecimal;
import java.util.Calendar;
import java.util.Date;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.entity.SettingSystem;
import com.example.repository.SettingSystemRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PricingService {
    
    @Autowired
    private SettingSystemRepository settingSystemRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Tự động tính giá dựa vào ngày chiếu
     * @param showTime - Thời gian chiếu phim
     * @return Giá vé tự động
     */
    public BigDecimal calculatePrice(Date showTime) {
        try {
            // Lấy cấu hình giá từ database
            SettingSystem setting = settingSystemRepository.findByType("TICKET_PRICE")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình giá vé"));
            
            // Parse JSON từ config_data
            JsonNode config = objectMapper.readTree(setting.getConfigData());
            
            // Kiểm tra ngày trong tuần
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(showTime);
            int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
            
            boolean isWeekend = (dayOfWeek == Calendar.SATURDAY || dayOfWeek == Calendar.SUNDAY);
            
            // ✅ FIX: Kiểm tra null trước khi asText()
            JsonNode priceNode;
            if (isWeekend) {
                priceNode = config.get("weekendPrice");
                if (priceNode == null) {
                    throw new RuntimeException("Thiếu cấu hình 'weekend_price' trong database");
                }
            } else {
                priceNode = config.get("weekdayPrice");
                if (priceNode == null) {
                    throw new RuntimeException("Thiếu cấu hình 'weekday_price' trong database");
                }
            }
            
            String priceString = priceNode.asText();
            return new BigDecimal(priceString);
            
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tính giá: " + e.getMessage(), e);
        }
    }
    
    /**
     * Lấy thông tin cấu hình giá hiện tại
     */
    public SettingSystem getPriceConfig() {
        return settingSystemRepository.findByType("TICKET_PRICE")
            .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình giá vé"));
    }
}