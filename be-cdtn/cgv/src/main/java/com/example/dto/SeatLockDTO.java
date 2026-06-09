package com.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatLockDTO {
    private String action; // "LOCK", "UNLOCK", "LOCKED_SUCCESS", "LOCKED_FAILED", "UNLOCKED_SUCCESS"
    private Integer slotId;
    private Integer seatId;
    private Integer userId;
    private String message;
}
