package com.example.service.SeatLock;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.service.SeatLock.SeatLockService.SeatLockDTO;

/**
 * API quản lý khoá ghế (SeatLock)
 *
 * POST   /api/v1/seat-locks/lock      — Khoá ghế (user nhấn Tiếp tục)
 * DELETE /api/v1/seat-locks/release   — Giải phóng ghế của user
 * GET    /api/v1/seat-locks           — Lấy danh sách ghế đang bị khoá trong slot
 * GET    /api/v1/seat-locks/my-expiry — Lấy thời gian lock của user hiện tại
 */
@RestController
@RequestMapping("api/v1/seat-locks")
public class SeatLockController {

    @Autowired
    private SeatLockService seatLockService;

    /**
     * Khoá ghế — gọi khi user nhấn "Tiếp tục"
     * Body: { "accountId": 1, "slotId": 5, "seatIds": [10, 11, 12] }
     */
    @PostMapping("/lock")
    public ResponseEntity<?> lockSeats(@RequestBody LockRequest req) {
        try {
            LocalDateTime expiresAt = seatLockService.lockSeats(req.accountId(), req.slotId(), req.seatIds());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "expiresAt", expiresAt.toString(),
                    "message", "Ghế đã được giữ trong 10 phút"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Giải phóng ghế — gọi khi user hủy hoặc trang đóng
     */
    @DeleteMapping("/release")
    public ResponseEntity<?> releaseSeats(
            @RequestParam Integer accountId,
            @RequestParam Integer slotId) {
        seatLockService.releaseSeats(accountId, slotId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * Lấy danh sách ghế đang bị khoá trong một suất chiếu
     * Dùng để poll và hiển thị ghế "🔒 đang được giữ"
     */
    @GetMapping
    public ResponseEntity<List<SeatLockDTO>> getLockedSeats(@RequestParam Integer slotId) {
        return ResponseEntity.ok(seatLockService.getLockedSeats(slotId));
    }

    /**
     * Lấy thời gian hết hạn lock của user trong slot
     */
    @GetMapping("/my-expiry")
    public ResponseEntity<?> getMyExpiry(
            @RequestParam Integer accountId,
            @RequestParam Integer slotId) {
        LocalDateTime expiry = seatLockService.getLockExpiry(accountId, slotId);
        if (expiry == null) {
            return ResponseEntity.ok(Map.of("expiresAt", (Object) null));
        }
        return ResponseEntity.ok(Map.of("expiresAt", expiry.toString()));
    }

    // ── Request record ─────────────────────────────────────────────────
    public record LockRequest(Integer accountId, Integer slotId, List<Integer> seatIds) {}
}
