package com.example.form.Slot;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.OptBoolean;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSlotForm {
    private Integer movieId;
    
    private Integer roomId;
    
    
    // ✅ QUAN TRỌNG: Thêm lenient = false để parse chính xác
    @JsonFormat(
        pattern = "yyyy-MM-dd HH:mm:ss", 
        timezone = "Asia/Ho_Chi_Minh",
        lenient = OptBoolean.FALSE
    )
    private Date showTime;
    
    @JsonFormat(
        pattern = "yyyy-MM-dd HH:mm:ss", 
        timezone = "Asia/Ho_Chi_Minh",
        lenient = OptBoolean.FALSE
    )
    private Date endTime;
}