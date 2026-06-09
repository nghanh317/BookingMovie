package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.example.dto.SeatLockDTO;
import com.example.service.SeatLock.SeatLockService;

@Controller
public class SeatWebSocketController {

    @Autowired
    private SeatLockService seatLockService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Lắng nghe các action từ client gửi lên đường dẫn "/app/seat/action"
     * Payload mong đợi: { action: "LOCK" | "UNLOCK", slotId: 1, seatId: 10, userId: 99 }
     */
    @MessageMapping("/seat/action")
    public void handleSeatAction(@Payload SeatLockDTO payload) {
        String action = payload.getAction();
        Integer slotId = payload.getSlotId();
        Integer seatId = payload.getSeatId();
        Integer userId = payload.getUserId();

        if ("LOCK".equalsIgnoreCase(action)) {
            boolean success = seatLockService.lockSingleSeat(slotId, seatId, userId);
            if (success) {
                // Broadcast cho tất cả user đang xem chung phòng chiếu này
                payload.setAction("LOCKED_SUCCESS");
                payload.setMessage("Ghế đã bị khoá bởi người khác");
                messagingTemplate.convertAndSend("/topic/slot/" + slotId, payload);
            } else {
                // Phát loa thất bại, user nào trùng userId sẽ tự rollback UI
                payload.setAction("LOCKED_FAILED");
                payload.setMessage("Ghế này vừa bị người khác nhanh tay chọn mất!");
                messagingTemplate.convertAndSend("/topic/slot/" + slotId, payload);
            }
        } else if ("UNLOCK".equalsIgnoreCase(action)) {
            seatLockService.unlockSingleSeat(slotId, seatId, userId);
            // Broadcast để tất cả màn hình nhả ghế ra thành màu trắng
            payload.setAction("UNLOCKED_SUCCESS");
            payload.setMessage("Ghế đã được nhả");
            messagingTemplate.convertAndSend("/topic/slot/" + slotId, payload);
        }
    }
}
