# Tài liệu tích hợp API dành cho Frontend (API Integration Guide)

Tài liệu này cung cấp đầy đủ chi tiết của toàn bộ hệ thống API Backend Portfolio phục vụ việc xây dựng giao diện Landing Page chính, phân nhánh Mobile/Game, các trang tĩnh (Privacy, Terms, Donation), Bảng xếp hạng game, hệ thống liên hệ, bình luận và quản lý đa ngôn ngữ nâng cao.

---

## 1. Thông Tin Chung & Bảo Mật

* **Base URL:** `http://localhost:5000` (môi trường local) hoặc URL deploy của server.
* **Xác thực (Authentication):** Các API sửa đổi dữ liệu (POST, PUT, DELETE) yêu cầu gửi kèm Header:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
  *(Token lấy từ API đăng nhập `/api/auth/login`)*

* **Tần suất gọi API (Rate Limiting):**
  * Các API thông thường: Giới hạn tối đa **100 requests / 15 phút** cho mỗi IP.
  * Các API đăng nhập/khôi phục mật khẩu: Giới hạn nghiêm ngặt **15 requests / 15 phút** để tránh brute-force.

* **Kiến trúc đa ngôn ngữ (Localization):**
  Các trường hiển thị động (`title`, `description`, `content`, `excerpt`, `headline`, `subHeadline`, `changelog.notes`) được lưu trữ dạng **Map of String**.
  Khi gọi API lấy thông tin, backend trả về toàn bộ đối tượng ngôn ngữ để Frontend lưu trữ client-side và cho phép chuyển đổi ngôn ngữ tức thời không cần tải lại trang.
  Ví dụ định dạng trả về:
  ```json
  "title": {
    "vi": "Dự án Quản lý Công việc",
    "en": "Task Management Project",
    "ja": "タスク管理プロジェクト",
    "ko": "작업 관리 프로젝트",
    "zh": "任务管理项目"
  }
  ```

---

## 2. API Xác Thực & Quản Trị (Auth)

### 2.1. Đăng nhập Admin
* **Endpoint:** `POST /api/auth/login`
* **Body:**
  ```json
  {
    "username": "admin",
    "password": "yourpassword"
  }
  ```
* **Response thành công (200 OK):**
  ```json
  {
    "_id": "69eb002f617735509f1ca460",
    "username": "admin",
    "avatar": "https://res.cloudinary.com/...",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 2.2. Đổi mật khẩu (Yêu cầu đăng nhập)
* **Endpoint:** `PUT /api/auth/change-password`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Body:** `{ "currentPassword": "oldpassword", "newPassword": "newpassword123" }`

---

## 3. API Quản Lý Thông Tin Cá Nhân (Profile)

### 3.1. Lấy thông tin Profile theo nhánh
* **Endpoint:** `GET /api/profile/:type`
* **Tham số `:type`:** `main` (Landing chính), `mobile` (Nhánh Mobile), `game` (Nhánh Game).
* **Response mẫu (200 OK):**
  ```json
  {
    "_id": "69eb064f596663010e2a07da",
    "profileType": "main",
    "headline": {
      "vi": "Xin chào, mình là một Lập trình viên đam mê công nghệ.",
      "en": "Hi, I am a passionate software developer."
    },
    "subHeadline": {
      "vi": "Mình định hướng phát triển các giải pháp phần mềm toàn diện...",
      "en": "I focus on developing comprehensive software solutions..."
    },
    "techStack": ["Flutter", "React", "Node.js", "MongoDB"],
    "avatarUrl": "https://res.cloudinary.com/...",
    "socialLinks": {
      "github": "https://github.com/Huy2004P",
      "linkedin": "https://linkedin.com/in/huy-portfolio"
    }
  }
  ```

### 3.2. Cập nhật thông tin Profile (Admin Only)
* **Endpoint:** `PUT /api/profile/:type`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Body:** Truyền tương tự cấu trúc trên (bao gồm Map cho `headline` và `subHeadline`).

---

## 4. API Quản Lý Dự Án (Projects)

### 4.1. Lấy danh sách dự án
* **Endpoint:** `GET /api/projects`
* **Query Parameters (Tùy chọn):**
  * `type`: Lọc dự án theo kiểu (`web`, `mobile`, `game`, `other`).
  * `search`: Từ khóa tìm kiếm (so khớp trong Map của `title`, `description` và mảng `technologies`).
  * `page`, `limit`: Phân trang.
* **Response (Đa ngôn ngữ):**
  ```json
  {
    "data": [
      {
        "_id": "6a278a107cdf35406618117a",
        "title": {
          "vi": "Todo List App",
          "en": "Todo List App"
        },
        "description": {
          "vi": "Ứng dụng quản lý công việc hàng ngày...",
          "en": "A daily task management application..."
        },
        "imageUrl": "https://res.cloudinary.com/...",
        "screenshots": ["https://res.cloudinary.com/..."],
        "projectType": "mobile",
        "projectUrl": "https://github.com/Huy2004P/todo_list_app",
        "apkUrl": "https://res.cloudinary.com/...",
        "likesCount": 5,
        "clicks": {
          "apk": 10,
          "github": 24
        },
        "changelog": [
          {
            "version": "1.0.1",
            "date": "2026-06-10T12:00:00.000Z",
            "notes": {
              "vi": "Sửa lỗi crash khi khởi động",
              "en": "Fix startup crash bug"
            }
          }
        ]
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
  ```

### 4.2. Thả tim/Thích dự án (Công khai)
* **Endpoint:** `POST /api/projects/:id/like`
* **Response:** `{ "message": "Project liked successfully", "likesCount": 6 }`

### 4.3. Theo dõi Click/Tải liên kết (Công khai)
* **Endpoint:** `POST /api/projects/:id/click`
* **Body:** `{ "destination": "apk" }` // Tương tự: 'github', 'demo', 'playstore', 'appstore', 'itchio'
* **Response:** `{ "message": "Click tracked successfully", "clicks": { "apk": 11 } }`

---

## 5. API Bài Viết Blog (Posts)

### 5.1. Lấy danh sách bài viết
* **Endpoint:** `GET /api/posts`
* **Query Parameters:** `category`, `tag`, `search`, `page`, `limit`
* **Response:** Tương tự như Projects. Trường `title`, `excerpt`, và `content` là đối tượng Map ngôn ngữ.

### 5.2. Thả tim/Thích bài viết (Công khai)
* **Endpoint:** `POST /api/posts/:id/like`
* **Response:** `{ "message": "Post liked successfully", "likesCount": 12 }`

---

## 6. API Hệ Thống Bình Luận (Comments)

Hỗ trợ đăng bình luận dưới bài viết Blog, trả lời lồng nhau (nested replies) và lọc quản trị.

### 6.1. Gửi bình luận (Công khai)
* **Endpoint:** `POST /api/comments`
* **Body:**
  ```json
  {
    "postId": "69eb0a37596663010e2a07db",
    "playerName": "Huy Hoang",
    "email": "hoang@example.com",
    "content": "Bài viết rất hữu ích!",
    "parentId": null // Gửi ID của bình luận trước để tạo luồng reply
  }
  ```
* **Response (201 Created):** Trả về đối tượng comment vừa tạo.

### 6.2. Lấy bình luận đã duyệt của bài viết (Công khai)
* **Endpoint:** `GET /api/comments/post/:postId`
* **Response:** Trả về mảng các bình luận sắp xếp theo thời gian tăng dần.

### 6.3. Quản lý bình luận (Admin Only)
* **Lấy danh sách:** `GET /api/comments` (Query filter: `?status=pending` hoặc `?postId=...`)
* **Duyệt bình luận:** `PUT /api/comments/:id/status` | Body: `{ "status": "approved" }` (hoặc `pending`)
* **Xóa bình luận:** `DELETE /api/comments/:id`

---

## 7. API Liên Hệ & Gửi Telegram (Contact Form)

### 7.1. Gửi thư liên hệ (Công khai)
* **Endpoint:** `POST /api/contact`
* **Body:**
  ```json
  {
    "name": "Nguyen Van A",
    "email": "van.a@example.com",
    "subject": "Hợp tác dự án",
    "message": "Chào bạn, mình muốn liên hệ công việc..."
  }
  ```
* **Hoạt động:** Server lưu tin nhắn vào database đồng thời tự động gửi thông báo trực tiếp qua Telegram Bot đến máy chủ của quản trị viên (yêu cầu cấu hình `TELEGRAM_BOT_TOKEN` và `TELEGRAM_CHAT_ID` trong file `.env` của Backend).

### 7.2. Quản lý liên hệ (Admin Only)
* **Danh sách tin nhắn:** `GET /api/contact`
* **Đánh dấu đã đọc:** `PUT /api/contact/:id/read`
* **Xóa tin nhắn:** `DELETE /api/contact/:id`

---

## 8. API Đăng Ký Newsletter

### 8.1. Đăng ký nhận tin tức (Công khai)
* **Endpoint:** `POST /api/subscriber`
* **Body:** `{ "email": "newsletter@example.com" }`
* **Response:** `{ "message": "Subscribed successfully" }`

### 8.2. Danh sách Subscriber (Admin Only)
* **Lấy danh sách:** `GET /api/subscriber`
* **Xóa subscriber:** `DELETE /api/subscriber/:id`

---

## 9. API Từ Điển Bản Dịch Tĩnh (Dictionary - Dịch Toàn UI Giao Diện)

Dùng để dịch các nhãn tĩnh trên giao diện của website (ví dụ: nút bấm, tiêu đề cột, nhãn chuyển hướng).

### 9.1. Lấy toàn bộ từ điển (Công khai)
* **Endpoint:** `GET /api/dictionary`
* **Response:** Trả về danh sách tất cả các key cùng toàn bộ bản dịch.

### 9.2. Lấy từ điển tối ưu theo ngôn ngữ (Công khai)
* **Endpoint:** `GET /api/dictionary/:lang` (Ví dụ: `GET /api/dictionary/ja` hoặc `GET /api/dictionary/vi`)
* **Response (Trả về định dạng flat JSON siêu gọn nhẹ để frontend dùng trực tiếp):**
  ```json
  {
    "nav_home": "ホーム",
    "btn_submit": "送信",
    "lbl_loading": "読み込み中..."
  }
  ```

### 9.3. Cập nhật hoặc tạo nhãn từ điển mới (Admin Only)
* **Endpoint:** `PUT /api/dictionary/:key`
* **Body:**
  ```json
  {
    "key": "nav_home",
    "translations": {
      "vi": "Trang chủ",
      "en": "Home",
      "ja": "ホーム",
      "ko": "홈",
      "zh": "首页"
    }
  }
  ```

---

## 10. API Thống Kê Admin Dashboard (Admin Stats)

* **Endpoint:** `GET /api/admin/dashboard-stats`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Response thành công (200 OK):**
  ```json
  {
    "counts": {
      "projects": 3,
      "posts": 1,
      "comments": 2,
      "subscribers": 12,
      "messages": 5,
      "unreadMessages": 2
    },
    "engagement": {
      "totalProjectClicks": 34,
      "totalProjectLikes": 18,
      "totalPostLikes": 42,
      "projectStats": [
        {
          "id": "6a278a107cdf35406618117a",
          "title": { "vi": "Todo List App", "en": "Todo List App" },
          "clicks": 10,
          "likes": 5
        }
      ]
    },
    "system": {
      "platform": "linux",
      "arch": "x64",
      "cpuCount": 4,
      "uptime": 12530,
      "freeMemoryGB": "1.45",
      "totalMemoryGB": "3.84",
      "memoryUsagePercent": "62.2",
      "nodeVersion": "v18.16.0"
    }
  }
  ```

---

## 11. Tối Ưu Hóa Hình Ảnh Upload (WebP Optimizer)

* Khi Admin thực hiện tải ảnh lên qua **`POST /api/upload`**, Backend sẽ sử dụng công nghệ `sharp` để tự động nén dung lượng và chuyển đổi định dạng ảnh sang **WebP** trước khi lưu trữ lên Cloudinary.
* Cách hoạt động này giảm kích thước tập tin trung bình từ 60% - 80% nhưng vẫn giữ nguyên độ sắc nét cao giúp website load siêu tốc.
* Response trả về URL ảnh kết thúc bằng định dạng `.webp`.
