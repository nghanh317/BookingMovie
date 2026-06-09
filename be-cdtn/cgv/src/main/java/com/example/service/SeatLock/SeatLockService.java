package com.example.service.SeatLock;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.dto.SeatLockDTO;

@Service
public class SeatLockService {

    private static final int LOCK_MINUTES = 10;
    private static final String KEY_PREFIX = "lock:slot:";

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Helper: Tạo key format lock:slot:{slotId}:seat:{seatId}
    private String getLockKey(Integer slotId, Integer seatId) {
        return KEY_PREFIX + slotId + ":seat:" + seatId;
    }

    /**
     * Khoá 1 ghế (Dành cho WebSocket khi user click)
     * Trả về true nếu khoá thành công (atomic setIfAbsent)
     */
    public boolean lockSingleSeat(Integer slotId, Integer seatId, Integer accountId) {
        String key = getLockKey(slotId, seatId);
        Boolean success = redisTemplate.opsForValue().setIfAbsent(key, String.valueOf(accountId), Duration.ofMinutes(LOCK_MINUTES));
        return Boolean.TRUE.equals(success);
    }

    /**
     * Mở khoá 1 ghế (Dành cho WebSocket)
     */
    public void unlockSingleSeat(Integer slotId, Integer seatId, Integer accountId) {
        String key = getLockKey(slotId, seatId);
        Object lockOwner = redisTemplate.opsForValue().get(key);
        if (lockOwner != null && lockOwner.toString().equals(String.valueOf(accountId))) {
            redisTemplate.delete(key);
        }
    }

    /**
     * Lấy danh sách ID ghế đang bị khoá trong một suất chiếu
     */
    public List<Integer> getLockedSeats(Integer slotId) {
        String pattern = KEY_PREFIX + slotId + ":seat:*";
        Set<String> keys = redisTemplate.keys(pattern);
        List<Integer> lockedSeats = new ArrayList<>();
        if (keys != null) {
            for (String key : keys) {
                // key format: lock:slot:1:seat:5
                String[] parts = key.split(":");
                if (parts.length == 5) {
                    try {
                        lockedSeats.add(Integer.parseInt(parts[4]));
                    } catch (NumberFormatException ignored) {}
                }
            }
        }
        return lockedSeats;
    }

    /**
     * Lấy danh sách ID ghế và ID người khoá (Dành cho SeatService)
     */
    public java.util.Map<Integer, Integer> getLockedSeatsWithOwners(Integer slotId) {
        String pattern = KEY_PREFIX + slotId + ":seat:*";
        Set<String> keys = redisTemplate.keys(pattern);
        java.util.Map<Integer, Integer> lockedSeats = new java.util.HashMap<>();
        if (keys != null && !keys.isEmpty()) {
            for (String key : keys) {
                String[] parts = key.split(":");
                if (parts.length == 5) {
                    try {
                        Integer seatId = Integer.parseInt(parts[4]);
                        Object owner = redisTemplate.opsForValue().get(key);
                        if (owner != null) {
                            lockedSeats.put(seatId, Integer.parseInt(owner.toString()));
                        }
                    } catch (NumberFormatException ignored) {}
                }
            }
        }
        return lockedSeats;
    }

    /**
     * Giải phóng tất cả ghế của một user trong một suất chiếu (Dành cho REST / Cleanup)
     */
    public void releaseSeats(Integer accountId, Integer slotId) {
        String pattern = KEY_PREFIX + slotId + ":seat:*";
        Set<String> keys = redisTemplate.keys(pattern);
        if (keys != null) {
            for (String key : keys) {
                Object owner = redisTemplate.opsForValue().get(key);
                if (owner != null && owner.toString().equals(String.valueOf(accountId))) {
                    redisTemplate.delete(key);
                    
                    // Extract seatId from key format lock:slot:{slotId}:seat:{seatId}
                    String[] parts = key.split(":");
                    if (parts.length == 5) {
                        try {
                            int seatId = Integer.parseInt(parts[4]);
                            SeatLockDTO payload = new SeatLockDTO();
                            payload.setSeatId(seatId);
                            payload.setUserId(accountId);
                            payload.setSlotId(slotId);
                            payload.setAction("UNLOCKED_SUCCESS");
                            payload.setMessage("Ghế đã được nhả");
                            messagingTemplate.convertAndSend("/topic/slot/" + slotId, payload);
                        } catch (NumberFormatException ignored) {}
                    }
                }
            }
        }
    }

    /**
     * Khoá danh sách ghế cùng lúc (Dành cho REST API cũ khi nhấn Tiếp tục)
     * Dùng setIfAbsent. Nếu 1 ghế thất bại -> Rollback tất cả các ghế vừa khoá.
     */
    public boolean lockSeatsBatch(Integer accountId, Integer slotId, List<Integer> seatIds) {
        List<String> successfullyLocked = new ArrayList<>();
        
        for (Integer seatId : seatIds) {
            String key = getLockKey(slotId, seatId);
            
            // Check nếu chính user này đang giữ ghế này (đã click chọn trước đó)
            Object currentOwner = redisTemplate.opsForValue().get(key);
            if (currentOwner != null && currentOwner.toString().equals(String.valueOf(accountId))) {
                // Đã là của user này, chỉ cần reset TTL
                redisTemplate.expire(key, Duration.ofMinutes(LOCK_MINUTES));
                successfullyLocked.add(key);
                continue;
            }

            Boolean success = redisTemplate.opsForValue().setIfAbsent(key, String.valueOf(accountId), Duration.ofMinutes(LOCK_MINUTES));
            if (Boolean.TRUE.equals(success)) {
                successfullyLocked.add(key);
            } else {
                // Rollback
                for (String lockedKey : successfullyLocked) {
                    Object owner = redisTemplate.opsForValue().get(lockedKey);
                    if (owner != null && owner.toString().equals(String.valueOf(accountId))) {
                        redisTemplate.delete(lockedKey);
                    }
                }
                throw new RuntimeException("Ghế đang được người khác giữ. Vui lòng chọn ghế khác.");
            }
        }
        
        // Phát loa WebSocket cho các user khác biết những ghế này đã bị khoá
        for (Integer seatId : seatIds) {
            SeatLockDTO payload = new SeatLockDTO();
            payload.setSeatId(seatId);
            payload.setUserId(accountId);
            payload.setSlotId(slotId);
            payload.setAction("LOCKED_SUCCESS");
            payload.setMessage("Ghế đã bị khoá bởi người khác");
            messagingTemplate.convertAndSend("/topic/slot/" + slotId, payload);
        }
        
        return true;
    }
}
