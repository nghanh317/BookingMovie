package com.example.service.Mail;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import com.example.form.Tickets.BookingConfirmEmailForm;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendResetPasswordEmail(String toEmail, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            String uniqueSubject = "Yêu cầu đặt lại mật khẩu - CGV Cinema [" + System.currentTimeMillis() + "]";
            helper.setSubject(uniqueSubject);

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>"
                + "<div style='text-align: center; margin-bottom: 20px;'>"
                + "<img src='https://www.cgv.vn/skin/frontend/cgv/default/images/cgvlogo.png' alt='CGV Logo' style='max-width: 150px;'/>"
                + "</div>"
                + "<h2 style='color: #e71a0f; text-align: center;'>ĐẶT LẠI MẬT KHẨU</h2>"
                + "<p style='font-size: 16px; color: #333;'>Xin chào,</p>"
                + "<p style='font-size: 16px; color: #333;'>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với địa chỉ email này. Vui lòng nhấn vào nút bên dưới để tiến hành đặt lại mật khẩu mới:</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<a href='" + resetLink + "' style='background-color: #e71a0f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;'>Đổi Mật Khẩu</a>"
                + "</div>"
                + "<p style='font-size: 14px; color: #777;'>Lưu ý: Link này chỉ có hiệu lực trong vòng <strong>15 phút</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này để đảm bảo an toàn cho tài khoản.</p>"
                + "<hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />"
                + "<p style='font-size: 12px; color: #999; text-align: center;'>Đây là email tự động, vui lòng không phản hồi.<br/>&copy; 2026 CGV Cinema Vietnam.</p>"
                + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    public void sendBookingConfirmEmail(BookingConfirmEmailForm data) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(data.getTo_email());
            String uniqueSubject = "Xác nhận đặt vé thành công [" + data.getBooking_code() + "] - CGV Cinema";
            helper.setSubject(uniqueSubject);

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>"
                + "<div style='text-align: center; margin-bottom: 20px;'>"
                + "<img src='https://www.cgv.vn/skin/frontend/cgv/default/images/cgvlogo.png' alt='CGV Logo' style='max-width: 150px;'/>"
                + "</div>"
                + "<h2 style='color: #e71a0f; text-align: center;'>ĐẶT VÉ THÀNH CÔNG!</h2>"
                + "<p style='font-size: 16px; color: #333;'>Chào <strong>" + data.getTo_name() + "</strong>,</p>"
                + "<p style='font-size: 16px; color: #333;'>Cảm ơn bạn đã đặt vé tại CGV Cinema. Dưới đây là thông tin vé của bạn:</p>"
                + "<div style='background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #e71a0f;'>"
                + "<p style='margin: 10px 0;'><strong>Mã vé:</strong> <span style='font-size: 18px; color: #e71a0f; font-weight: bold; font-family: monospace;'>" + data.getBooking_code() + "</span></p>"
                + "<p style='margin: 10px 0;'><strong>Phim:</strong> " + data.getMovie_title() + "</p>"
                + "<p style='margin: 10px 0;'><strong>Rạp:</strong> " + data.getCinema_name() + "</p>"
                + "<p style='margin: 10px 0;'><strong>Suất chiếu:</strong> " + data.getShowtime() + "</p>"
                + "<p style='margin: 10px 0;'><strong>Ghế:</strong> " + data.getSeats() + "</p>"
                + "<p style='margin: 10px 0;'><strong>Tổng tiền:</strong> " + data.getTotal() + "</p>"
                + "</div>"
                + "<p style='font-size: 14px; color: #555;'>Vui lòng mang mã vé này đến quầy hoặc máy tự động tại rạp để nhận vé cứng trước giờ chiếu.</p>"
                + "<hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />"
                + "<p style='font-size: 12px; color: #999; text-align: center;'>Đây là email tự động, vui lòng không phản hồi.<br/>&copy; 2026 CGV Cinema Vietnam.</p>"
                + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    public void sendWelcomeEmail(String toEmail, String toName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            String uniqueSubject = "Chào mừng đến với CGV Cinema [" + System.currentTimeMillis() + "]";
            helper.setSubject(uniqueSubject);

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>"
                + "<div style='text-align: center; margin-bottom: 20px;'>"
                + "<img src='https://www.cgv.vn/skin/frontend/cgv/default/images/cgvlogo.png' alt='CGV Logo' style='max-width: 150px;'/>"
                + "</div>"
                + "<h2 style='color: #e71a0f; text-align: center;'>ĐĂNG KÝ THÀNH CÔNG!</h2>"
                + "<p style='font-size: 16px; color: #333;'>Chào <strong>" + toName + "</strong>,</p>"
                + "<p style='font-size: 16px; color: #333;'>Cảm ơn bạn đã đăng ký tài khoản thành công tại CGV Cinema. Giờ đây bạn đã có thể bắt đầu tận hưởng những trải nghiệm điện ảnh tuyệt vời cùng với nhiều ưu đãi độc quyền dành riêng cho thành viên.</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<a href='http://localhost:5173/login' style='background-color: #e71a0f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;'>Đăng nhập ngay</a>"
                + "</div>"
                + "<hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />"
                + "<p style='font-size: 12px; color: #999; text-align: center;'>Đây là email tự động, vui lòng không phản hồi.<br/>&copy; 2026 CGV Cinema Vietnam.</p>"
                + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}
