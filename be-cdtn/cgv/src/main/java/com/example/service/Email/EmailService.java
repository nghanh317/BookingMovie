package com.example.service.Email;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Async //Giup mail chạy ngầm, web không bị lag
    public void sendHtmlEmail (String to, String subject, String htmlContent){
        try{
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.print("Email đã được gửi thành công đến: " + to);
        } catch (MessagingException e){
            System.out.println("Lỗi gửi mail: " + e.getMessage());
        }
    }

    // Cac hàm tạo nội dung html
    // --- TEMPLATE CHUNG CHO CÁC MAIL ---
    private String getEmailHeader() {
        return "<div style='background-color: #1a1a1a; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>" +
               "<h1 style='color: #e50914; margin: 0; font-family: sans-serif; letter-spacing: 2px;'>CINEMA STAR</h1>" +
               "</div>" +
               "<div style='background-color: #ffffff; padding: 30px; border: 1px solid #dddddd; border-top: none; font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>";
    }

    private String getEmailFooter() {
        return "<div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777; text-align: center;'>" +
               "<p>Đây là email tự động, vui lòng không trả lời.<br>Hotline: 1900 1234 | Website: www.cinemastar.vn</p>" +
               "<p>© 2026 Cinema Star - Trải nghiệm điện ảnh đỉnh cao</p>" +
               "</div>" +
               "</div>";
    }
    //1. Đăng ký thành công
    public void sendWelcomeEmail(String to, String fullName){
        String subject = "Chào mừng bạn đến với Cinema Star!";
        String content = getEmailHeader() +
                "<h2 style='color: #333;'>Chào mừng bạn, " + fullName + "!</h2>" +
                "<p>Chúc mừng bạn đã trở thành thành viên của <b>Cinema Star</b>. Hãy sẵn sàng để tận hưởng những thước phim bom tấn cùng vô vàn ưu đãi hấp dẫn.</p>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<a href='#' style='background-color: #e50914; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>ĐẶT VÉ NGAY</a>" +
                "</div>" +
                getEmailFooter();
        sendHtmlEmail(to, subject, content);
    }

    //2. Đặt vé thành công (Chờ thanh toán)
    public void sendBookingEmail(String to, String fullName, String movieName, String seats, String time, String total){
        String subject = "Thông báo đặt vé thành công - " + movieName;
        String content = getEmailHeader() +
                "<h2 style='color: #e50914;'>Đặt vé thành công!</h2>" +
                "<p>Chào " + fullName + ", chúng tôi đã nhận được yêu cầu đặt vé của bạn.</p>" +
                "<div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 5px solid #ffc107;'>" +
                "<p style='margin: 5px 0;'><b>Phim:</b> " + movieName + "</p>" +
                "<p style='margin: 5px 0;'><b>Suất chiếu:</b> " + time + "</p>" +
                "<p style='margin: 5px 0;'><b>Ghế:</b> " + seats + "</p>" +
                "<p style='margin: 5px 0;'><b>Tổng tiền:</b> <span style='font-size: 18px; font-weight: bold;'>" + total + " VNĐ</span></p>" +
                "</div>" +
                "<p>Trạng thái: <span style='color: #ffc107; font-weight: bold;'>Đang chờ thanh toán</span></p>" +
                "<p>Vui lòng hoàn tất thanh toán để nhận mã vé chính thức.</p>" +
                getEmailFooter();
        sendHtmlEmail(to, subject, content);
    }

    //3. Thanh toán thành công (Xác nhận vé)
    public void sendPaymentSuccessEmail(String to, String fullName, String movieName, String seats, String time, String total, String ticketCode){
        String subject = "Xác nhận thanh toán thành công - Vé xem phim " + movieName;
        String content = getEmailHeader() +
                "<h2 style='color: #28a745;'>Thanh toán thành công!</h2>" +
                "<p>Chào " + fullName + ", thanh toán của bạn đã được xác nhận. Dưới đây là vé xem phim của bạn:</p>" +
                "<div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 5px solid #28a745;'>" +
                "<p style='margin: 5px 0;'><b>Mã vé:</b> <span style='color: #e50914; font-weight: bold;'>" + ticketCode + "</span></p>" +
                "<p style='margin: 5px 0;'><b>Phim:</b> " + movieName + "</p>" +
                "<p style='margin: 5px 0;'><b>Suất chiếu:</b> " + time + "</p>" +
                "<p style='margin: 5px 0;'><b>Ghế:</b> " + seats + "</p>" +
                "<p style='margin: 5px 0;'><b>Tổng tiền:</b> <span style='font-size: 18px; font-weight: bold;'>" + total + " VNĐ</span></p>" +
                "</div>" +
                "<div style='text-align: center; margin-top: 20px;'>" +
                "<p><b>Mã QR vào cổng:</b></p>" +
                "<img src='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + ticketCode + "' alt='QR Code'>" +
                "</div>" +
                "<p style='color: #777; font-size: 13px;'>* Vui lòng xuất trình mã QR này tại rạp để nhận vé.</p>" +
                getEmailFooter();
        sendHtmlEmail(to, subject, content);
    }
}