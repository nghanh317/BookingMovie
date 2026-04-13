// Mock data - Movies
export const MOVIES = [
  {
    id: 1,
    title: "Avengers: Secret Wars",
    originalTitle: "Avengers: Secret Wars",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&q=80",
    backdrop: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1920&q=80",
    rating: 8.4,
    genre: ["Hành động", "Phiêu lưu", "Khoa học viễn tưởng"],
    duration: 150,
    language: "Tiếng Anh",
    releaseDate: "2026-05-01",
    director: "Joe Russo",
    cast: ["Robert Downey Jr.", "Chris Evans", "Scarlett Johansson"],
    description: "Các siêu anh hùng Marvel đối mặt với mối đe dọa lớn nhất từ trước đến nay khi các vũ trụ song song va chạm nhau.",
    trailer: "https://www.youtube.com/embed/TcMBFSGVi1c",
    status: "now_showing",
    ageRating: "T13",
  },
  {
    id: 2,
    title: "Godzilla vs. Kong: The New Empire",
    originalTitle: "Godzilla x Kong: The New Empire",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80",
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80",
    rating: 7.2,
    genre: ["Hành động", "Khoa học viễn tưởng"],
    duration: 115,
    language: "Tiếng Anh",
    releaseDate: "2026-03-29",
    director: "Adam Wingard",
    cast: ["Rebecca Hall", "Brian Tyree Henry", "Dan Stevens"],
    description: "Hai con quái vật huyền thoại Godzilla và Kong đối mặt với mối đe dọa khổng lồ ẩn nấp trong lòng đất.",
    trailer: "https://www.youtube.com/embed/lV1OOlGwExM",
    status: "now_showing",
    ageRating: "T13",
  },
  {
    id: 3,
    title: "Dune: Phần Ba",
    originalTitle: "Dune: Part Three",
    poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500&q=80",
    backdrop: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
    rating: 9.1,
    genre: ["Khoa học viễn tưởng", "Phiêu lưu", "Drama"],
    duration: 165,
    language: "Tiếng Anh",
    releaseDate: "2026-06-20",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Austin Butler"],
    description: "Paul Atreides tiếp tục hành trình lên ngôi báu trên hành tinh sa mạc Arrakis trong chương cuối sử thi.",
    trailer: "https://www.youtube.com/embed/Way9Dexny3w",
    status: "coming_soon",
    ageRating: "T13",
  },
  {
    id: 4,
    title: "Lật Mặt 8",
    originalTitle: "Lật Mặt 8",
    poster: "https://images.unsplash.com/photo-1594909122845-11baa2b50be7?w=500&q=80",
    backdrop: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80",
    rating: 7.8,
    genre: ["Hài", "Tình cảm", "Gia đình"],
    duration: 120,
    language: "Tiếng Việt",
    releaseDate: "2026-04-30",
    director: "Lý Hải",
    cast: ["Lý Hải", "Minh Hà", "Quang Sự"],
    description: "Thương hiệu điện ảnh quốc dân trở lại với câu chuyện gia đình đầy cảm xúc và tiếng cười.",
    trailer: "https://www.youtube.com/embed/TcMBFSGVi1c",
    status: "coming_soon",
    ageRating: "P",
  },
  {
    id: 5,
    title: "Spider-Man: Beyond the Spider-Verse",
    originalTitle: "Spider-Man: Beyond the Spider-Verse",
    poster: "https://images.unsplash.com/photo-1559163499-413811fb2344?w=500&q=80",
    backdrop: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&q=80",
    rating: 9.3,
    genre: ["Hoạt hình", "Hành động", "Phiêu lưu"],
    duration: 140,
    language: "Tiếng Anh",
    releaseDate: "2026-07-04",
    director: "Joaquim Dos Santos",
    cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
    description: "Miles Morales trở lại trong chương kết thúc epic của hành trình xuyên đa vũ trụ.",
    trailer: "https://www.youtube.com/embed/cqGjhVmlMDs",
    status: "coming_soon",
    ageRating: "K",
  },
  {
    id: 6,
    title: "Venom: The Last Dance",
    originalTitle: "Venom: The Last Dance",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&q=80",
    backdrop: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=80",
    rating: 6.5,
    genre: ["Hành động", "Khoa học viễn tưởng"],
    duration: 109,
    language: "Tiếng Anh",
    releaseDate: "2026-02-15",
    director: "Kelly Marcel",
    cast: ["Tom Hardy", "Chiwetel Ejiofor", "Juno Temple"],
    description: "Eddie Brock và Venom trên chuyến hành trình cuối cùng khi lực lượng hủy diệt của Knull đang cận kề.",
    trailer: "https://www.youtube.com/embed/GJiYTBW0oE8",
    status: "now_showing",
    ageRating: "T13",
  },
];

// Mock data - Cinemas
export const CINEMAS = [
  {
    id: 1,
    name: "CGV Vincom Center",
    address: "72 Lê Thánh Tôn, Q.1, TP.HCM",
    city: "Hồ Chí Minh",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400",
    screens: 8,
    rating: 4.5,
  },
  {
    id: 2,
    name: "Lotte Cinema Landmark",
    address: "72A Nguyễn Thị Minh Khai, Q.3, TP.HCM",
    city: "Hồ Chí Minh",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
    screens: 10,
    rating: 4.7,
  },
  {
    id: 3,
    name: "BHD Star Cineplex",
    address: "Bitexco Financial Tower, Q.1, TP.HCM",
    city: "Hồ Chí Minh",
    image: "https://images.unsplash.com/photo-1560109947-543149eceb16?w=400",
    screens: 6,
    rating: 4.3,
  },
  {
    id: 4,
    name: "CGV Vincom Bà Triệu",
    address: "191 Bà Triệu, Hai Bà Trưng, Hà Nội",
    city: "Hà Nội",
    image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400",
    screens: 8,
    rating: 4.6,
  },
];

// Mock data - Showtimes
export const SHOWTIMES = [
  // ── Avengers: Secret Wars (movieId: 1) ──────────────────
  // Hôm nay: 11/04/2026
  { id: 1,  movieId: 1, cinemaId: 1, date: "2026-04-11", time: "09:30", hall: "Cinema 1", type: "2D",   availableSeats: 45 },
  { id: 2,  movieId: 1, cinemaId: 1, date: "2026-04-11", time: "12:00", hall: "Cinema 2", type: "3D",   availableSeats: 30 },
  { id: 3,  movieId: 1, cinemaId: 1, date: "2026-04-11", time: "15:30", hall: "Cinema 1", type: "2D",   availableSeats: 60 },
  { id: 4,  movieId: 1, cinemaId: 1, date: "2026-04-11", time: "19:00", hall: "IMAX",     type: "IMAX", availableSeats: 10 },
  { id: 5,  movieId: 1, cinemaId: 1, date: "2026-04-11", time: "21:30", hall: "Cinema 3", type: "2D",   availableSeats: 55 },
  // Ngày mai: 12/04/2026
  { id: 6,  movieId: 1, cinemaId: 1, date: "2026-04-12", time: "10:00", hall: "Cinema 2", type: "3D",   availableSeats: 70 },
  { id: 7,  movieId: 1, cinemaId: 1, date: "2026-04-12", time: "14:30", hall: "IMAX",     type: "IMAX", availableSeats: 25 },
  { id: 8,  movieId: 1, cinemaId: 1, date: "2026-04-12", time: "18:00", hall: "Cinema 1", type: "2D",   availableSeats: 50 },
  { id: 9,  movieId: 1, cinemaId: 1, date: "2026-04-12", time: "21:00", hall: "Cinema 3", type: "3D",   availableSeats: 40 },
  // 13/04:
  { id: 10, movieId: 1, cinemaId: 2, date: "2026-04-13", time: "11:00", hall: "Hall A",   type: "2D",   availableSeats: 65 },
  { id: 11, movieId: 1, cinemaId: 2, date: "2026-04-13", time: "15:00", hall: "Hall B",   type: "3D",   availableSeats: 48 },
  { id: 12, movieId: 1, cinemaId: 2, date: "2026-04-13", time: "19:30", hall: "Hall A",   type: "IMAX", availableSeats: 18 },
  // 14/04:
  { id: 13, movieId: 1, cinemaId: 3, date: "2026-04-14", time: "09:00", hall: "Screen 1", type: "2D",   availableSeats: 72 },
  { id: 14, movieId: 1, cinemaId: 3, date: "2026-04-14", time: "13:30", hall: "Screen 2", type: "3D",   availableSeats: 35 },
  { id: 15, movieId: 1, cinemaId: 3, date: "2026-04-14", time: "20:00", hall: "Screen 1", type: "2D",   availableSeats: 60 },

  // ── Godzilla vs Kong (movieId: 2) ────────────────────────
  { id: 20, movieId: 2, cinemaId: 1, date: "2026-04-11", time: "10:00", hall: "Cinema 2", type: "2D",   availableSeats: 70 },
  { id: 21, movieId: 2, cinemaId: 1, date: "2026-04-11", time: "14:00", hall: "Cinema 4", type: "3D",   availableSeats: 40 },
  { id: 22, movieId: 2, cinemaId: 1, date: "2026-04-11", time: "18:00", hall: "IMAX",     type: "IMAX", availableSeats: 20 },
  { id: 23, movieId: 2, cinemaId: 1, date: "2026-04-11", time: "21:15", hall: "Cinema 2", type: "3D",   availableSeats: 55 },
  { id: 24, movieId: 2, cinemaId: 2, date: "2026-04-12", time: "11:30", hall: "Hall B",   type: "2D",   availableSeats: 80 },
  { id: 25, movieId: 2, cinemaId: 2, date: "2026-04-12", time: "16:00", hall: "Hall A",   type: "IMAX", availableSeats: 22 },
  { id: 26, movieId: 2, cinemaId: 2, date: "2026-04-12", time: "20:30", hall: "Hall B",   type: "3D",   availableSeats: 38 },
  { id: 27, movieId: 2, cinemaId: 4, date: "2026-04-13", time: "10:30", hall: "Room 1",   type: "2D",   availableSeats: 60 },
  { id: 28, movieId: 2, cinemaId: 4, date: "2026-04-13", time: "15:30", hall: "Room 2",   type: "3D",   availableSeats: 45 },
  { id: 29, movieId: 2, cinemaId: 4, date: "2026-04-14", time: "19:00", hall: "Room 1",   type: "IMAX", availableSeats: 15 },

  // ── Venom: The Last Dance (movieId: 6) ─────────────────
  { id: 40, movieId: 6, cinemaId: 1, date: "2026-04-11", time: "11:00", hall: "Cinema 3", type: "2D",   availableSeats: 80 },
  { id: 41, movieId: 6, cinemaId: 1, date: "2026-04-11", time: "15:00", hall: "Cinema 4", type: "3D",   availableSeats: 50 },
  { id: 42, movieId: 6, cinemaId: 1, date: "2026-04-11", time: "19:30", hall: "Cinema 3", type: "2D",   availableSeats: 65 },
  { id: 43, movieId: 6, cinemaId: 2, date: "2026-04-12", time: "09:30", hall: "Hall A",   type: "2D",   availableSeats: 78 },
  { id: 44, movieId: 6, cinemaId: 2, date: "2026-04-12", time: "14:00", hall: "Hall B",   type: "3D",   availableSeats: 42 },
  { id: 45, movieId: 6, cinemaId: 2, date: "2026-04-12", time: "18:30", hall: "Hall A",   type: "2D",   availableSeats: 58 },
  { id: 46, movieId: 6, cinemaId: 3, date: "2026-04-13", time: "12:00", hall: "Screen 2", type: "3D",   availableSeats: 30 },
  { id: 47, movieId: 6, cinemaId: 3, date: "2026-04-13", time: "17:00", hall: "Screen 1", type: "2D",   availableSeats: 55 },
  { id: 48, movieId: 6, cinemaId: 4, date: "2026-04-14", time: "20:00", hall: "Room 2",   type: "3D",   availableSeats: 40 },

  // ── Dune: Phần Ba (movieId: 3) ───────────────────────────
  { id: 50, movieId: 3, cinemaId: 1, date: "2026-04-11", time: "13:00", hall: "Cinema 1", type: "2D",   availableSeats: 55 },
  { id: 51, movieId: 3, cinemaId: 1, date: "2026-04-11", time: "17:30", hall: "IMAX",     type: "IMAX", availableSeats: 28 },
  { id: 52, movieId: 3, cinemaId: 2, date: "2026-04-12", time: "10:00", hall: "Hall A",   type: "2D",   availableSeats: 62 },
  { id: 53, movieId: 3, cinemaId: 2, date: "2026-04-12", time: "15:00", hall: "Hall B",   type: "3D",   availableSeats: 44 },
  { id: 54, movieId: 3, cinemaId: 3, date: "2026-04-13", time: "19:00", hall: "Screen 1", type: "IMAX", availableSeats: 20 },

  // ── Lật Mặt 8 (movieId: 4) ──────────────────────────────
  { id: 60, movieId: 4, cinemaId: 1, date: "2026-04-11", time: "10:30", hall: "Cinema 4", type: "2D",   availableSeats: 75 },
  { id: 61, movieId: 4, cinemaId: 1, date: "2026-04-11", time: "14:00", hall: "Cinema 3", type: "2D",   availableSeats: 68 },
  { id: 62, movieId: 4, cinemaId: 1, date: "2026-04-11", time: "18:30", hall: "Cinema 4", type: "2D",   availableSeats: 50 },
  { id: 63, movieId: 4, cinemaId: 1, date: "2026-04-11", time: "21:00", hall: "Cinema 3", type: "2D",   availableSeats: 60 },
  { id: 64, movieId: 4, cinemaId: 2, date: "2026-04-12", time: "11:00", hall: "Hall B",   type: "2D",   availableSeats: 80 },
  { id: 65, movieId: 4, cinemaId: 2, date: "2026-04-12", time: "16:30", hall: "Hall A",   type: "2D",   availableSeats: 55 },
  { id: 66, movieId: 4, cinemaId: 3, date: "2026-04-13", time: "13:00", hall: "Screen 2", type: "2D",   availableSeats: 70 },
  { id: 67, movieId: 4, cinemaId: 4, date: "2026-04-14", time: "17:30", hall: "Room 1",   type: "2D",   availableSeats: 65 },

  // ── Spider-Man: Beyond the Spider-Verse (movieId: 5) ────
  { id: 70, movieId: 5, cinemaId: 1, date: "2026-04-11", time: "09:00", hall: "Cinema 2", type: "2D",   availableSeats: 72 },
  { id: 71, movieId: 5, cinemaId: 1, date: "2026-04-11", time: "13:30", hall: "Cinema 4", type: "3D",   availableSeats: 48 },
  { id: 72, movieId: 5, cinemaId: 1, date: "2026-04-11", time: "17:00", hall: "IMAX",     type: "IMAX", availableSeats: 30 },
  { id: 73, movieId: 5, cinemaId: 1, date: "2026-04-11", time: "20:30", hall: "Cinema 2", type: "3D",   availableSeats: 42 },
  { id: 74, movieId: 5, cinemaId: 2, date: "2026-04-12", time: "10:30", hall: "Hall A",   type: "2D",   availableSeats: 65 },
  { id: 75, movieId: 5, cinemaId: 2, date: "2026-04-12", time: "15:30", hall: "Hall B",   type: "3D",   availableSeats: 38 },
  { id: 76, movieId: 5, cinemaId: 3, date: "2026-04-13", time: "11:30", hall: "Screen 1", type: "IMAX", availableSeats: 22 },
  { id: 77, movieId: 5, cinemaId: 3, date: "2026-04-13", time: "16:00", hall: "Screen 2", type: "3D",   availableSeats: 50 },
  { id: 78, movieId: 5, cinemaId: 4, date: "2026-04-14", time: "14:00", hall: "Room 2",   type: "2D",   availableSeats: 60 },
];

// Seat layout
export const SEAT_ROWS = ['A','B','C','D','E','F','G','H'];
export const SEAT_COLS = 10;

export const SEAT_TYPES = {
  standard: { label: 'Thường',   price: 75000,  color: 'bg-cinema-surface border-cinema-border' },
  vip:      { label: 'VIP',      price: 110000, color: 'bg-yellow-900/30 border-yellow-700/50' },
  couple:   { label: 'Ghế đôi',  price: 200000, color: 'bg-red-900/30 border-red-700/50' },
};

export const AGE_RATINGS = {
  P:   { label: 'P',   desc: 'Phổ biến mọi lứa tuổi', color: 'bg-green-500' },
  K:   { label: 'K',   desc: 'Khán giả nhỏ tuổi có phụ huynh đi kèm', color: 'bg-blue-500' },
  T13: { label: 'T13', desc: 'Cấm khán giả dưới 13 tuổi', color: 'bg-yellow-500' },
  T16: { label: 'T16', desc: 'Cấm khán giả dưới 16 tuổi', color: 'bg-orange-500' },
  T18: { label: 'T18', desc: 'Cấm khán giả dưới 18 tuổi', color: 'bg-red-500' },
};

export const GENRES = [
  'Tất cả', 'Hành động', 'Tình cảm', 'Hài', 'Kinh dị',
  'Hoạt hình', 'Khoa học viễn tưởng', 'Drama', 'Gia đình', 'Phiêu lưu',
];

export const PAYMENT_METHODS = [
  { id: 'momo',    label: 'MoMo',         desc: 'Thanh toán qua ví MoMo',    color: '#AE2070' },
  { id: 'zalopay', label: 'ZaloPay',      desc: 'Thanh toán qua ZaloPay',    color: '#0068FF' },
  { id: 'vnpay',   label: 'VNPay',        desc: 'Thanh toán qua VNPay QR',   color: '#0A2E6E' },
  { id: 'card',    label: 'Thẻ tín dụng', desc: 'Visa / Mastercard / JCB',   color: '#1A1F36' },
];

// Mock data - Vouchers (toàn hệ thống)
export const VOUCHERS = [
  { id: 'V001', code: 'WELCOME30', type: 'percent', value: 30, minOrder: 100000, desc: 'Giảm 30% cho lần đặt vé đầu tiên', expiry: '2026-12-31', stock: 999, active: true, isPublic: true, pointCost: 0 },
  { id: 'V002', code: 'SUMMER20',  type: 'percent', value: 20, minOrder: 150000, desc: 'Ưu đãi mùa hè – Giảm 20%',         expiry: '2026-07-31', stock: 500, active: true, isPublic: true, pointCost: 0 },
  { id: 'V003', code: 'FREESHIP', type: 'fixed',   value: 15000, minOrder: 0,      desc: 'Miễn phí phí dịch vụ',             expiry: '2026-06-30', stock: 200, active: true, isPublic: true, pointCost: 0 },
  { id: 'V004', code: 'VIP50K',   type: 'fixed',   value: 50000, minOrder: 200000, desc: 'Giảm 50.000đ cho thành viên VIP',  expiry: '2026-09-30', stock: 100, active: true, isPublic: false, pointCost: 500 },
  { id: 'V005', code: 'GOLD25',   type: 'percent', value: 25, minOrder: 120000, desc: 'Đặc quyền thành viên Gold – 25%',  expiry: '2026-10-31', stock: 150, active: true, isPublic: false, pointCost: 300 },
  { id: 'V006', code: 'COMBO15',  type: 'percent', value: 15, minOrder: 80000,  desc: 'Giảm 15% khi đặt kèm bỏng nước',  expiry: '2026-08-31', stock: 300, active: false, isPublic: true, pointCost: 0 },
];

// Voucher của từng user (mock – key là userId)
export const USER_VOUCHERS = {
  1: ['V001', 'V004', 'V005'],
  2: ['V001', 'V003'],
};

// Mock data - Snack items
export const SNACK_ITEMS = [
  { id: 's1', name: 'Bỏng rang bơ', icon: '🍿', desc: 'Bỏng rang bơ thơm vị size M (80g)', price: 45000, category: 'snack' },
  { id: 's2', name: 'Nước uống',    icon: '🥤', desc: 'Coca / Pepsi / nước suối size M (500ml)', price: 35000, category: 'drink' },
  { id: 'c1', name: 'Combo Đôi',    icon: '🎉', desc: '1 Bỏng rang + 1 Nước uống', price: 70000, category: 'combo' },
  { id: 'c2', name: 'Combo Gia Đình', icon: '🎊', desc: '1 Bỏng rang + 2 Nước uống', price: 95000, category: 'combo' },
];
