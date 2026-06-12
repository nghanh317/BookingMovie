// ===== ĐĂNG NHẬP =====
// Hàm này nhận vào 2 tham số từ form đăng nhập của người dùng
export const loginApi = async (userName, passwordHash) => {
    // 1. Khai báo URL
    const url = 'http://localhost:8080/api/v1/auth/login';
    
    // 2. Chuẩn bị dữ liệu gửi đi (giống hệt cấu trúc trong Postman)
    const bodyData = { 
        userName: userName, 
        passwordHash: passwordHash 
    };

    try {
        // 3. Thực hiện gọi API
        const response = await fetch(url, {
            method: 'POST', // Phương thức POST
            headers: {
                'Content-Type': 'application/json' // Báo cho Backend biết FE đang gửi JSON
            },
            body: JSON.stringify(bodyData) // Chuyển object JS thành chuỗi JSON
        });

        // 4. Kiểm tra lỗi (nếu sai pass, server trả về 401 hoặc 400)
        if (!response.ok) {
            throw new Error('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu!');
        }

        // 5. Nếu thành công (200 OK), bóc tách dữ liệu JSON trả về
        const data = await response.json();
        return data; 
        
    } catch (error) {
        console.error("Lỗi gọi API:", error);
        throw error; // Ném lỗi ra ngoài để giao diện xử lý
    }
}

// ===== ĐĂNG KÝ =====
// Hàm này nhận vào các tham số từ form đăng ký
export const registerApi = async (userName, passwordHash, email, phone, fullName) => {
    // 1. Khai báo URL
    const url = 'http://localhost:8080/api/v1/auth/register';
    
    // 2. Chuẩn bị dữ liệu gửi đi (khớp với CreateAccountForm của Backend)
    const bodyData = { 
        userName: userName,       // Tên đăng nhập
        passwordHash: passwordHash, // Mật khẩu (backend sẽ mã hóa bằng BCrypt)
        email: email,             // Email
        phone: phone,             // Số điện thoại
        fullName: fullName        // Họ và tên
    };

    try {
        // 3. Thực hiện gọi API
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });

        // 4. Kiểm tra lỗi (ví dụ: trùng userName, email đã tồn tại...)
        if (!response.ok) {
            const errorText = await response.text();
            let errorMsg = 'Đăng ký thất bại. Vui lòng thử lại!';
            try {
                const errObj = JSON.parse(errorText);
                if (errObj.message) errorMsg = errObj.message;
            } catch (e) {
                if (errorText) errorMsg = errorText;
            }
            throw new Error(errorMsg);
        }

        // 5. Nếu thành công, backend trả về chuỗi "Đăng ký thành công"
        const data = await response.text();
        return data; 
        
    } catch (error) {
        console.error("Lỗi gọi API đăng ký:", error);
        throw error;
    }
}