package com.example.service.Payment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.entity.Tickets;
import com.example.repository.TicketRepository;

import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;

@Service
public class PayOSService {

    @Autowired
    private PayOS payOS;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private com.example.repository.SlotRepository slotRepository;

    @Autowired
    private com.example.repository.BookingSeatRepository bookingSeatRepository;

    @Transactional
    public void cancelTicketAndReleaseSeats(Tickets ticket) {
        if (ticket.getStatus() == Tickets.Status.CANCELLED) return;

        ticket.setStatus(Tickets.Status.CANCELLED);
        ticketRepository.save(ticket);

        // Release seats
        com.example.entity.Slots slot = ticket.getSlots();
        if (slot != null) {
            java.util.List<com.example.entity.BookingSeats> bookingSeats = 
                bookingSeatRepository.findByTickets_IdAndIsDeleted(ticket.getId(), false);
                
            if (bookingSeats != null && !bookingSeats.isEmpty()) {
                int count = bookingSeats.size();
                for (com.example.entity.BookingSeats bs : bookingSeats) {
                    bs.setIsDeleted(true);
                    bookingSeatRepository.save(bs);
                }
                slot.setEmptySeats(slot.getEmptySeats() + count);
                slotRepository.save(slot);
                System.out.printf("[PayOSService] Nhả %d ghế cho suất chiếu %d%n", count, slot.getId());
            }
        }
    }

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Test mode: true → gửi giá ảo 2000đ lên PayOS (để test miễn phí),
     *            DB vẫn lưu giá thật.
     *            false → gửi giá thật lên PayOS (production).
     */
    @Value("${payment.test-mode:false}")
    private boolean testMode;

    // Số tiền ảo gửi lên PayOS khi test (2000đ — mức tối thiểu PayOS chấp nhận)
    private static final long TEST_AMOUNT = 2000L;

    // ─────────────────────────────────────────────────────────────
    // LUỒNG 1: Tạo link thanh toán PayOS
    // ─────────────────────────────────────────────────────────────
    public CreatePaymentLinkResponse createPaymentLink(Integer ticketId) throws Exception {
        Tickets ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé ID: " + ticketId));

        if (ticket.getPaymentStatus() == Tickets.PaymentStatus.PAID) {
            throw new RuntimeException("Vé này đã được thanh toán rồi");
        }
        if (ticket.getStatus() == Tickets.Status.CANCELLED) {
            throw new RuntimeException("Vé này đã bị hủy, không thể thanh toán");
        }

        long orderCode  = ticketId.longValue();
        long realAmount = ticket.getFinalAmount().longValue();

        // Test mode: gửi giá ảo lên PayOS, DB không thay đổi (vẫn giữ giá thật)
        long amountToSend = testMode ? TEST_AMOUNT : realAmount;

        String description = ticket.getTicketsCode();
        String returnUrl   = frontendUrl + "/payment-result?ticketId=" + ticketId + "&status=success";
        String cancelUrl   = frontendUrl + "/payment-result?ticketId=" + ticketId + "&status=cancel";

        if (testMode) {
            System.out.printf("[PayOS TEST MODE] ticketId=%d | Giá thật: %,d đ | Gửi PayOS: %,d đ%n",
                    ticketId, realAmount, amountToSend);
        }

        CreatePaymentLinkRequest request = CreatePaymentLinkRequest.builder()
                .orderCode(orderCode)
                .amount(amountToSend)   // giá ảo khi test, giá thật khi production
                .description(description)
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .build();

        CreatePaymentLinkResponse response = payOS.paymentRequests().create(request);
        return response;
    }

    // ─────────────────────────────────────────────────────────────
    // LUỒNG 2: Xử lý Webhook từ PayOS
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public void handleWebhook(Webhook webhookBody) throws Exception {
        WebhookData data = payOS.webhooks().verify(webhookBody);

        long   orderCode   = data.getOrderCode();
        String code        = data.getCode();        // "00" = thành công
        long   paidAmount  = data.getAmount() != null ? data.getAmount() : 0L;

        // Bỏ qua webhook probe/test của PayOS
        if (orderCode == 123456789L) return;

        Integer ticketId = (int) orderCode;
        Tickets ticket   = ticketRepository.findById(ticketId).orElse(null);
        if (ticket == null) return;

        // Idempotent
        if (ticket.getPaymentStatus() == Tickets.PaymentStatus.PAID) return;

        if ("00".equals(code)) {
            // Test mode: bỏ qua kiểm tra số tiền (PayOS gửi giá ảo 2000đ, DB lưu giá thật)
            // Production: có thể thêm kiểm tra: paidAmount == ticket.getFinalAmount().longValue()
            if (!testMode) {
                long expectedAmount = ticket.getFinalAmount().longValue();
                if (paidAmount != expectedAmount) {
                    System.err.printf("[Webhook] CẢNH BÁO: Số tiền không khớp! PayOS=%d, DB=%d, ticketId=%d%n",
                            paidAmount, expectedAmount, ticketId);
                    // Có thể throw exception để từ chối, hoặc log và cho qua tùy chính sách
                }
            } else {
                System.out.printf("[PayOS TEST MODE] Webhook OK cho ticketId=%d, bỏ qua kiểm tra tiền (PayOS=%dđ, DB=%dđ)%n",
                        ticketId, paidAmount, ticket.getFinalAmount().longValue());
            }

            ticket.setPaymentStatus(Tickets.PaymentStatus.PAID);
            ticket.setStatus(Tickets.Status.CONFIRMED);
            ticketRepository.save(ticket);
        } else {
            cancelTicketAndReleaseSeats(ticket);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // LUỒNG 3: Sync trạng thái từ PayOS (dùng bởi Cronjob)
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public void syncTicketStatusFromPayOS(Integer ticketId) {
        try {
            Tickets ticket = ticketRepository.findById(ticketId).orElse(null);
            if (ticket == null || ticket.getPaymentStatus() == Tickets.PaymentStatus.PAID) return;

            PaymentLink info   = payOS.paymentRequests().get(ticketId.longValue());
            String      status = info.getStatus() != null ? info.getStatus().toString() : "";

            if ("PAID".equalsIgnoreCase(status)) {
                ticket.setPaymentStatus(Tickets.PaymentStatus.PAID);
                ticket.setStatus(Tickets.Status.CONFIRMED);
                ticketRepository.save(ticket);
            } else if ("CANCELLED".equalsIgnoreCase(status) || "EXPIRED".equalsIgnoreCase(status)) {
                cancelTicketAndReleaseSeats(ticket);
            }
        } catch (Exception e) {
            System.err.println("[PayOSService] syncStatus lỗi ticketId=" + ticketId + ": " + e.getMessage());
        }
    }

    public boolean isTestMode() {
        return testMode;
    }
}
