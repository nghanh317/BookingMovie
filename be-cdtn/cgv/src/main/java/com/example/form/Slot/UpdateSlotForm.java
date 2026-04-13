package com.example.form.Slot;

import java.math.BigDecimal;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat; // Nhớ import dòng này
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor; // Nên thêm cái này cho chắc

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateSlotForm {
    private Integer movieId;
    
    private Integer roomId;
    
    // THÊM VÀO ĐÂY
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    private Date showTime;
    
    // THÊM VÀO ĐÂY
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    private Date endTime;
    
    private BigDecimal price;
    
    private Integer emptySeats;
}