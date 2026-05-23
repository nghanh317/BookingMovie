package com.example.service.SeatLock;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.repository.SeatLockRepository;

/**
 * Scheduler tự động dọn dẹp SeatLock đã hết hạn.
 * Chạy mỗi 2 phút để giải phóng ghế bị bỏ quên.
 */
@Component
public class SeatLockCleanupScheduler {

    @Autowired
    private SeatLockRepository seatLockRepository;

    @Scheduled(fixedDelay = 120_000) // Mỗi 2 phút
    @Transactional
    public void cleanupExpiredLocks() {
        int released = seatLockRepository.releaseExpired(LocalDateTime.now());
        if (released > 0) {
            System.out.println("[SeatLock] Đã giải phóng " + released + " ghế hết hạn.");
        }
    }
}
