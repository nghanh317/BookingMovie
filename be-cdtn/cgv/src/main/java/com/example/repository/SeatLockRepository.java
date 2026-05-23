package com.example.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.entity.SeatLocks;

@Repository
public interface SeatLockRepository extends JpaRepository<SeatLocks, Integer> {

    /** Lấy tất cả lock còn active cho một slot (suất chiếu) */
    @Query("SELECT sl FROM SeatLocks sl WHERE sl.slotId = :slotId AND sl.isActive = true AND sl.expiresAt > :now")
    List<SeatLocks> findActiveBySlotId(@Param("slotId") Integer slotId, @Param("now") LocalDateTime now);

    /** Lấy lock active của một ghế trong một slot */
    @Query("SELECT sl FROM SeatLocks sl WHERE sl.seat.id = :seatId AND sl.slotId = :slotId AND sl.isActive = true AND sl.expiresAt > :now")
    List<SeatLocks> findActiveBySeatIdAndSlotId(@Param("seatId") Integer seatId, @Param("slotId") Integer slotId, @Param("now") LocalDateTime now);

    /** Lấy tất cả lock active của một user trong một slot */
    @Query("SELECT sl FROM SeatLocks sl WHERE sl.account.id = :accountId AND sl.slotId = :slotId AND sl.isActive = true AND sl.expiresAt > :now")
    List<SeatLocks> findActiveByAccountIdAndSlotId(@Param("accountId") Integer accountId, @Param("slotId") Integer slotId, @Param("now") LocalDateTime now);

    /** Giải phóng tất cả lock của user trong slot (khi hủy chọn hoặc thanh toán xong) */
    @Modifying
    @Query("UPDATE SeatLocks sl SET sl.isActive = false WHERE sl.account.id = :accountId AND sl.slotId = :slotId AND sl.isActive = true")
    void releaseByAccountIdAndSlotId(@Param("accountId") Integer accountId, @Param("slotId") Integer slotId);

    /** Giải phóng lock đã hết hạn (cho scheduler chạy định kỳ) */
    @Modifying
    @Query("UPDATE SeatLocks sl SET sl.isActive = false WHERE sl.isActive = true AND sl.expiresAt <= :now")
    int releaseExpired(@Param("now") LocalDateTime now);

    /** Kiểm tra ghế đã bị lock bởi người khác chưa */
    @Query("SELECT COUNT(sl) > 0 FROM SeatLocks sl WHERE sl.seat.id = :seatId AND sl.slotId = :slotId AND sl.account.id <> :accountId AND sl.isActive = true AND sl.expiresAt > :now")
    boolean isLockedByOther(@Param("seatId") Integer seatId, @Param("slotId") Integer slotId, @Param("accountId") Integer accountId, @Param("now") LocalDateTime now);
}
