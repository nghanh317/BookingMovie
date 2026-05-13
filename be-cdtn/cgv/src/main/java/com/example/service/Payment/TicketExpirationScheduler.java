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
 * Scheduler tự động hủy các vé chưa thanh toán sau 10 phút.
 * Chạy mỗi 5 phút để dọn dẹp.
 * Cần @EnableScheduling trong CgvApplication.java
 */
@Component
public class TicketExpirationScheduler {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Scheduled(fixedDelay = 5 * 60 * 1000) // Chạy mỗi 5 phút
    @Transactional
    public void cancelExpiredTickets() {
        // Tìm tất cả vé UNPAID + PENDING đã tạo hơn 10 phút trước
        Date cutoff = new Date(System.currentTimeMillis() - 10 * 60 * 1000);
        List<Tickets> expiredTickets = ticketRepository.findExpiredUnpaidTickets(cutoff);

        if (expiredTickets.isEmpty()) {
            return;
        }

        for (Tickets ticket : expiredTickets) {
            ticket.setStatus(Tickets.Status.CANCELLED);
            ticketRepository.save(ticket);

            // Hoàn lại ghế trống cho suất chiếu
            Slots slot = ticket.getSlots();
            if (slot != null && ticket.getBookingSeats() != null) {
                long count = ticket.getBookingSeats().stream()
                    .filter(bs -> bs.getIsDeleted() == null || !bs.getIsDeleted())
                    .count();
                if (count > 0) {
                    slot.setEmptySeats(slot.getEmptySeats() + (int) count);
                    slotRepository.save(slot);
                }
            }
        }

        System.out.println("[TicketScheduler] Auto-cancelled " + expiredTickets.size() + " expired tickets.");
    }
}
