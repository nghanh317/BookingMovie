package com.example.service.SeatLock;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.entity.Accounts;
import com.example.entity.SeatLocks;
import com.example.entity.Seats;
import com.example.repository.AccountRepository;
import com.example.repository.SeatLockRepository;
import com.example.repository.SeatRepository;

@Service
public class SeatLockService {

    private static final int LOCK_MINUTES = 10; // Thời gian giữ ghế: 10 phút

    @Autowired
    private SeatLockRepository seatLockRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private AccountRepository accountRepository;

    /**
     * Khoá danh sách ghế cho một user trong một slot.
     * Gọi khi user nhấn "Tiếp tục" sau khi chọn ghế.
     *
     * @param accountId  ID user đang đặt
     * @param slotId     ID suất chiếu
     * @param seatIds    Danh sách ID ghế cần khoá
     * @return lockedUntil — thời điểm hết hạn
     */
    @Transactional
    public LocalDateTime lockSeats(Integer accountId, Integer slotId, List<Integer> seatIds) {
        LocalDateTime now = LocalDateTime.now();

        // 1. Giải phóng lock cũ của user trong slot này (nếu có)
        seatLockRepository.releaseByAccountIdAndSlotId(accountId, slotId);

        // 2. Kiểm tra từng ghế có bị người khác lock không
        for (Integer seatId : seatIds) {
            boolean lockedByOther = seatLockRepository.isLockedByOther(seatId, slotId, accountId, now);
            if (lockedByOther) {
                Seats seat = seatRepository.findById(seatId).orElse(null);
                String label = seat != null ? seat.getSeatRow() + seat.getSeatNumber() : String.valueOf(seatId);
                throw new RuntimeException("Ghế " + label + " đang được người khác giữ. Vui lòng chọn ghế khác.");
            }
        }

        // 3. Lấy entities cần thiết
        Accounts account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản: " + accountId));

        LocalDateTime expiresAt = now.plusMinutes(LOCK_MINUTES);

        // 4. Tạo lock record cho từng ghế
        for (Integer seatId : seatIds) {
            Seats seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ghế: " + seatId));

            SeatLocks lock = new SeatLocks();
            lock.setSeat(seat);
            lock.setAccount(account);
            lock.setSlotId(slotId);
            lock.setLockedAt(now);
            lock.setExpiresAt(expiresAt);
            lock.setIsActive(true);
            seatLockRepository.save(lock);
        }

        return expiresAt;
    }

    /**
     * Giải phóng tất cả lock của user trong slot.
     * Gọi khi user hủy chọn hoặc trang bị đóng.
     */
    @Transactional
    public void releaseSeats(Integer accountId, Integer slotId) {
        seatLockRepository.releaseByAccountIdAndSlotId(accountId, slotId);
    }

    /**
     * Lấy danh sách ghế đang bị lock trong một slot.
     * Dùng để hiển thị ghế "đang được giữ" cho tất cả user.
     *
     * @return Danh sách DTO chứa seatId, accountId, expiresAt
     */
    public List<SeatLockDTO> getLockedSeats(Integer slotId) {
        LocalDateTime now = LocalDateTime.now();
        List<SeatLocks> locks = seatLockRepository.findActiveBySlotId(slotId, now);
        return locks.stream().map(lock -> new SeatLockDTO(
                lock.getSeat().getId(),
                lock.getAccount().getId(),
                lock.getSlotId(),
                lock.getExpiresAt()
        )).collect(Collectors.toList());
    }

    /**
     * Lấy thời gian còn lại của lock ghế của một user trong slot.
     * @return expiresAt nếu còn active, null nếu không có lock
     */
    public LocalDateTime getLockExpiry(Integer accountId, Integer slotId) {
        LocalDateTime now = LocalDateTime.now();
        List<SeatLocks> myLocks = seatLockRepository.findActiveByAccountIdAndSlotId(accountId, slotId, now);
        if (myLocks.isEmpty()) return null;
        return myLocks.get(0).getExpiresAt();
    }

    // ── DTO ────────────────────────────────────────────────────────────
    public record SeatLockDTO(Integer seatId, Integer accountId, Integer slotId, LocalDateTime expiresAt) {}
}
