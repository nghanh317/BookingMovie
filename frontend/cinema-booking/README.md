# CinemaBook — Frontend

> Ứng dụng đặt vé xem phim trực tuyến, xây dựng bằng **React.js + Tailwind CSS v3**.

---

## Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---|---|
| Node.js | 18.x trở lên |
| npm | 9.x trở lên |

---

## Cài đặt & Chạy local

```bash
# 1. Clone repository
git clone https://github.com/VanAnh3006-36/cinema-booking.git
cd cinema-booking

# 2. Cài đặt dependencies
npm install

# 3. Tạo file môi trường
cp .env.example .env

# 4. Chạy development server
npm run dev
```

Truy cập: **http://localhost:5173**

---

## Cấu trúc thư mục

```
src/
├── components/
│   ├── auth/           # Route guards (RequireAuth, RequireAdmin)
│   ├── layout/         # Navbar, Footer, Layout
│   ├── movie/          # MovieCard component
│   └── ui/             # BookingCard, Avatar, StepIndicator
├── constants/
│   └── mockData.js     # Dữ liệu mẫu (thay bằng API call khi có backend)
├── pages/
│   ├── Admin/          # Dashboard, Movies, Showtimes, Users, Revenue
│   ├── Auth/           # Login, Register, ForgotPassword
│   ├── Booking/        # Chọn suất chiếu
│   ├── Checkout/       # Thanh toán
│   ├── Home/           # Trang chủ
│   ├── MovieDetail/    # Chi tiết phim
│   ├── Movies/         # Danh sách phim
│   ├── Profile/        # Hồ sơ người dùng
│   └── SeatSelection/  # Chọn ghế
├── store/
│   └── authStore.js    # Zustand auth store (persist localStorage)
├── App.jsx             # Route definitions
└── main.jsx            # App entry point
```

---

## Phân quyền

| Route | Quyền truy cập |
|---|---|
| `/`, `/movies`, `/movies/:id` | Public |
| `/login`, `/register`, `/forgot-password` | Public |
| `/profile`, `/booking/*` | Phải đăng nhập (`RequireAuth`) |
| `/admin/*` | Chỉ tài khoản Admin (`RequireAdmin`) |

---

## Tích hợp Backend

Tất cả dữ liệu hiện tại đang dùng **mock data**. Khi Backend sẵn sàng, cần thay thế:

### 1. Authentication (`src/store/authStore.js`)

```js
// Hiện tại: kiểm tra mock accounts
// Thay bằng:
const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
  email, password
});
// Backend trả về: { user: {...}, token: "JWT_TOKEN" }
// Lưu token vào localStorage kèm user info
```

### 2. Dữ liệu phim, rạp, suất chiếu (`src/constants/mockData.js`)

```js
// Thay bằng API calls:
GET  /api/movies              → Danh sách phim
GET  /api/movies/:id          → Chi tiết phim
GET  /api/cinemas             → Danh sách rạp
GET  /api/showtimes?movieId=  → Suất chiếu theo phim
```

### 3. Đặt vé & Thanh toán (`src/pages/Checkout/Checkout.jsx`)

```js
// Thay setTimeout giả lập bằng:
POST /api/bookings            → Tạo đơn đặt vé
POST /api/payments/momo       → Khởi tạo thanh toán MoMo
POST /api/payments/vnpay      → Khởi tạo thanh toán VNPay
GET  /api/payments/callback   → Xác nhận kết quả thanh toán
```

### 4. Đăng nhập mạng xã hội

```js
POST /api/auth/google         → Xác thực Google OAuth token
POST /api/auth/facebook       → Xác thực Facebook OAuth token
```

### 5. Quên mật khẩu (`src/pages/Auth/ForgotPassword.jsx`)

```js
POST /api/auth/forgot-password    → Gửi OTP qua email/SMS
POST /api/auth/verify-otp         → Xác minh mã OTP
POST /api/auth/reset-password     → Đặt lại mật khẩu mới
```

---

## Biến môi trường

Xem file [`.env.example`](.env.example) để biết danh sách biến cần cấu hình.

---

## Tech Stack

| Thư viện | Mục đích |
|---|---|
| React 18 + Vite | Core framework |
| Tailwind CSS v3 | Styling |
| React Router v6 | Client-side routing |
| Zustand | State management (Auth) |
| Framer Motion | Animations |
| Swiper | Carousel/Slider |
| Axios | HTTP client (sẵn sàng dùng) |

---

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```
