package com.example.service.Payment;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.entity.Slots;
import com.example.entity.Tickets;
import com.example.repository.SlotRepository;
import com.example.repository.TicketRepository;

/**
 * LUỒNG 3: Dọn dẹp và đồng bộ dữ liệu (Cronjob)
 *
 * Chạy mỗi 1 phút, tìm các vé PENDING + UNPAID đã quá 10 phút:
 *   1. Gọi PayOS xem thực tế đã thanh toán chưa (tránh mất webhook)
 *   2. Nếu PayOS báo PAID  → cập nhật DB thành PAID + CONFIRMED
 *   3. Nếu PayOS báo khác  → hủy vé, hoàn ghế trống
 *
 * Cần @EnableScheduling trong CgvApplication.java
 */
@Component
public class TicketExpirationScheduler {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private PayOSService payOSService;

    @Scheduled(fixedDelay = 60 * 1000) // Chạy mỗi 1 phút
    @Transactional
    public void cancelExpiredTickets() {
        // Vé UNPAID + PENDING đã quá 10 phút
        Date cutoff = new Date(System.currentTimeMillis() - 10 * 60 * 1000);
        List<Tickets> expiredTickets = ticketRepository.findExpiredUnpaidTickets(cutoff);

        if (expiredTickets.isEmpty()) return;

        int synced = 0, cancelled = 0;

        for (Tickets ticket : expiredTickets) {
            // BƯỚC 1: Gọi PayOS kiểm tra trạng thái thực tế
            // (tránh trường hợp rớt mạng khiến webhook không đến)
            payOSService.syncTicketStatusFromPayOS(ticket.getId());

            // Reload lại từ DB sau khi sync
            Tickets updated = ticketRepository.findById(ticket.getId()).orElse(null);
            if (updated == null) continue;

            if (updated.getPaymentStatus() == Tickets.PaymentStatus.PAID) {
                // PayOS xác nhận đã thanh toán → giữ nguyên
                synced++;
                continue;
            }

            // BƯỚC 2: Thực sự chưa thanh toán → hủy và hoàn ghế
            payOSService.cancelTicketAndReleaseSeats(updated);
            cancelled++;
        }

        System.out.printf("[TicketScheduler] Đã xử lý %d vé hết hạn: %d sync từ PayOS → PAID, %d đã hủy.%n",
                expiredTickets.size(), synced, cancelled);
    }
}
