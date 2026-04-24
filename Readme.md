# Portfolio Backend API

Đây là hệ thống Backend cho ứng dụng web Portfolio full-stack. Hệ thống cung cấp các RESTful API để quản lý các dự án (projects), bài viết blog (posts), xác thực người dùng, thông tin cá nhân (profile), và tính năng tải ảnh lên. Backend được xây dựng trên nền tảng Node.js, Express và sử dụng cơ sở dữ liệu MongoDB.

## Các Tính Năng Chính

- **Xác thực & Phân quyền**: Hệ thống đăng nhập bảo mật sử dụng JWT (JSON Web Tokens) và mã hóa mật khẩu bằng bcrypt.
- **Quản lý Dự án**: Các thao tác CRUD (Tạo, Đọc, Sửa, Xóa) cho các dự án trong portfolio.
- **Quản lý Bài viết**: Thao tác CRUD cho các bài viết blog.
- **Quản lý Profile**: Quản lý thông tin chi tiết của chủ trang web và ảnh đại diện (avatar).
- **Upload Media**: Tích hợp trực tiếp tính năng tải ảnh lên Cloudinary thông qua thư viện Multer.
- **Cơ sở dữ liệu**: Mô hình hóa dữ liệu đối tượng MongoDB thông qua Mongoose.

## Công Nghệ Sử Dụng

- **Node.js** & **Express.js**: Framework chính xây dựng server.
- **MongoDB** & **Mongoose**: Cơ sở dữ liệu và thư viện ORM quản lý database.
- **JWT (jsonwebtoken)**: Dùng để xác thực bảo mật.
- **Bcryptjs**: Băm và bảo mật mật khẩu người dùng.
- **Cloudinary** & **Multer**: Xử lý việc upload ảnh và lưu trữ trên đám mây.
- **CORS**: Middleware xử lý lỗi truy cập chéo tên miền (Cross-Origin Resource Sharing).
- **Dotenv**: Quản lý các biến môi trường an toàn.

## Cấu Trúc Dự Án

```text
backend/
├── .env                  # Cấu hình các biến môi trường
├── server.js             # File gốc, điểm khởi chạy của ứng dụng
├── package.json          # Quản lý thông tin dự án và các thư viện dependencies
├── seed.js               # Script tạo dữ liệu mẫu (seed database)
├── middleware/           # Chứa các Express middleware tùy chỉnh (vd: xác thực auth)
├── models/               # Các file định nghĩa cấu trúc dữ liệu Mongoose schemas
│   ├── Post.js
│   ├── Profile.js
│   ├── Project.js
│   └── User.js
└── routes/               # Chứa các file định tuyến API cho Express
    ├── authRoutes.js     # /api/auth
    ├── postRoutes.js     # /api/posts
    ├── profileRoutes.js  # /api/profile
    ├── projectRoutes.js  # /api/projects
    └── uploadRoutes.js   # /api/upload
```

## Hướng Dẫn Cài Đặt

### 1. Yêu cầu hệ thống
- Đã cài đặt Node.js trên máy
- Có MongoDB chạy local hoặc sử dụng MongoDB Atlas
- Có tài khoản Cloudinary để lưu trữ ảnh

### 2. Cài đặt các thư viện (Dependencies)
```bash
npm install
```

### 3. Thiết lập Biến Môi Trường (Environment Variables)
Tạo một file `.env` ở thư mục gốc của dự án backend và thêm các biến sau:
```env
PORT=5000
MONGO_URI=chuoi_ket_noi_mongodb_cua_ban
JWT_SECRET=chuoi_bi_mat_jwt_cua_ban
CLOUDINARY_CLOUD_NAME=ten_cloud_cloudinary_cua_ban
CLOUDINARY_API_KEY=api_key_cloudinary_cua_ban
CLOUDINARY_API_SECRET=api_secret_cloudinary_cua_ban
```

### 4. Khởi chạy Server
Để chạy server trong môi trường phát triển (development) hoặc môi trường sản phẩm (production):
```bash
npm run dev
# HOẶC
npm start
```

Server sẽ được chạy tại địa chỉ `http://localhost:5000` (hoặc cổng mạng mà bạn đã thiết lập trong `.env`).

## Tổng quan về các API Endpoints

- **Auth (Xác thực)**: `POST /api/auth/login`, ...
- **Projects (Dự án)**: `GET`, `POST`, `PUT`, `DELETE` tại endpoint `/api/projects`
- **Posts (Bài viết)**: `GET`, `POST`, `PUT`, `DELETE` tại endpoint `/api/posts`
- **Profile (Hồ sơ)**: `GET`, `PUT` tại endpoint `/api/profile`
- **Upload (Tải file)**: `POST /api/upload`

Các route được bảo vệ (Protected routes) yêu cầu phải có một header `Authorization` chứa mã Bearer token hợp lệ.
