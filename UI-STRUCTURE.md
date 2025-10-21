# GIMME IDEA - CẤU TRÚC UI VÀ NAVIGATION

## TỔNG QUAN DỰ ÁN

**Tên dự án:** Gimme Idea
**Mô tả:** Nền tảng marketplace phi tập trung cho phép người dùng chia sẻ dự án, nhận feedback và kiếm thưởng
**Technology:** Next.js 15 + TypeScript + Tailwind CSS

**Tổng số trang:** 15 trang chính

---

## 📄 DANH SÁCH TOÀN BỘ CÁC TRANG

### 1️⃣ **TRANG CHỦ (Homepage)**
**Route:** `/`
**Truy cập:** Public (tất cả người dùng)

#### NỘI DUNG TRANG:
- Background gradient tím với hiệu ứng floating
- Logo "GIMME IDEA"
- Hero section với tagline: "Share Your Projects, Get Valuable Feedback"
- Mô tả về platform
- 2 buttons CTA chính

#### CÁC NÚT:
- Logo "G" → `/` (trang chủ) nếu chưa login, `/dashboard` nếu đã login
- "HOME" link → `/`
- "BROWSE" link → `/browse`
- "LOGIN" button → `/login`
- "GET STARTED" button → `/register`
- "EXPLORE PROJECTS" button → `/browse`
- Menu icon (mobile) → Mở mobile menu

#### TRANG TIẾP THEO:
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/browse` - Duyệt dự án
- `/dashboard` - Dashboard (nếu đã login và click logo)

---

### 2️⃣ **TRANG ĐĂNG NHẬP (Login)**
**Route:** `/login`
**Truy cập:** Public (chưa đăng nhập)

#### NỘI DUNG TRANG:
- Background matrix animation
- Logo nhỏ ở trên
- Card đăng nhập ở giữa màn hình
- Tiêu đề "Sign In"
- Form đăng nhập

#### CÁC NÚT:
- "Email" input
- "Password" input
- Icon Eye/EyeOff → Hiện/ẩn mật khẩu
- "Login" button → Submit form → `/dashboard`
- "Forgot Password" link → `/forgot-password`
- "Signup" link → `/register`

#### FORM:
- Email: Required, email format
- Password: Required, min 6 ký tự
- Submit action: `login()`
- Success: `/dashboard`

#### TRANG TIẾP THEO:
- `/dashboard` - Dashboard (login thành công)
- `/forgot-password` - Quên mật khẩu
- `/register` - Đăng ký

---

### 3️⃣ **TRANG ĐĂNG KÝ (Register)**
**Route:** `/register`
**Truy cập:** Public (chưa đăng nhập)

#### NỘI DUNG TRANG:
- Background matrix animation
- Logo nhỏ
- Card đăng ký
- Tiêu đề "Sign Up"
- Form đăng ký

#### CÁC NÚT:
- "Username" input
- "Email" input
- "Password" input
- Icon Eye/EyeOff (Password) → Hiện/ẩn
- "Confirm Password" input
- Icon Eye/EyeOff (Confirm) → Hiện/ẩn
- "Register" button → Submit → `/dashboard`
- "Already have account?" link → `/login`

#### FORM:
- Username: Required, min 3 ký tự
- Email: Required, email format
- Password: Required, min 6 ký tự
- Confirm Password: Required, phải khớp
- Submit action: `register()`
- Success: `/dashboard`

#### TRANG TIẾP THEO:
- `/dashboard` - Dashboard (đăng ký thành công)
- `/login` - Đăng nhập

---

### 4️⃣ **TRANG QUÊN MẬT KHẨU (Forgot Password)**
**Route:** `/forgot-password`
**Truy cập:** Public (chưa đăng nhập)

#### NỘI DUNG TRANG:
- Background matrix animation
- Logo nhỏ
- Card quên mật khẩu
- Tiêu đề "Forgot Password?"
- Form nhập email
- Success popup

#### CÁC NÚT:
- "← Back to Login" link → `/login`
- "Email Address" input
- "Send Reset Link" button → Hiện popup
- "OK" button (popup) → `/login`

#### FORM:
- Email: Required, email format
- Submit action: `forgotPassword(email)`
- Success: Popup "✅ Email Sent!"
- OK button: `/login`

#### TRANG TIẾP THEO:
- `/login` - Quay lại đăng nhập

---

### 5️⃣ **TRANG DASHBOARD (Bảng điều khiển)**
**Route:** `/dashboard`
**Truy cập:** Protected (phải đăng nhập)

#### NỘI DUNG TRANG:
- Sidebar bên trái
- Header ở trên
- Tiêu đề "My Dashboard" + "Welcome back, [username]!"
- 3 thẻ thống kê: Total Projects, Total Feedback, Total Views
- Grid hiển thị danh sách dự án của user
- Empty state nếu chưa có dự án

#### CÁC NÚT:

**SIDEBAR:**
- Logo "GIMME IDEA" → `/dashboard`
- "My Projects" → `/dashboard`
- "Browse" → `/browse`
- "New Project" → `/project/new`
- "Bookmarks" → `/bookmarks`
- "Profile" → `/profile`
- "Logout" button → Đăng xuất → `/`

**HEADER:**
- Logo "Gimme Idea!" → `/dashboard` (đã login)
- "Browse" → `/browse`
- "Submit Project" button → `/project/new`
- Bookmark icon → `/bookmarks`
- Dollar icon → `/earnings`
- Wallet button → Modal kết nối ví
- Avatar/User button → Dropdown menu

**USER MENU DROPDOWN:**
- "Dashboard" → `/dashboard`
- "Profile Settings" → `/profile`
- "Connect Wallet" button → Modal kết nối ví
- "Logout" (với icon exit) → Đăng xuất → `/`

**TRANG DASHBOARD:**
- "New Project" button → `/project/new`
- Project Card (click) → `/project/{id}`
- "Create Your First Project" button → `/project/new`

#### TRANG TIẾP THEO:
- `/browse` - Duyệt dự án
- `/project/new` - Tạo dự án mới
- `/bookmarks` - Dự án đã lưu
- `/profile` - Trang cá nhân
- `/earnings` - Thu nhập
- `/project/{id}` - Chi tiết dự án
- `/` - Trang chủ (logout)

---

### 6️⃣ **TRANG DUYỆT DỰ ÁN (Browse Projects)**
**Route:** `/browse`
**Truy cập:** Public (tất cả người dùng)

#### NỘI DUNG TRANG:
- Header navigation
- Tiêu đề "Browse Projects"
- Thanh tìm kiếm
- Sidebar filters: Category, Bounty Range, Status
- Grid dự án
- Pagination

#### CÁC NÚT:
- Search input → Tìm kiếm (debounce 500ms)
- Category filters: "All", "Web App", "Mobile App", "Design", "AI/ML", "Blockchain", "Game", "Tool", "Other"
- "Min" input (bounty)
- "Max" input (bounty)
- "Apply" button → Áp dụng filter
- Status dropdown: "All Status", "Published", "Draft"
- "Clear" button → Reset filters
- Project Card (click) → `/project/{id}`
- Pagination: "Previous", "1, 2, 3...", "Next"

#### TRANG TIẾP THEO:
- `/project/{id}` - Chi tiết dự án

---

### 7️⃣ **TRANG DỰ ÁN ĐÃ LƯU (Bookmarks)**
**Route:** `/bookmarks`
**Truy cập:** Protected (phải đăng nhập)

#### NỘI DUNG TRANG:
- Header navigation
- Tiêu đề "Bookmarked Projects"
- Subtitle "Projects you've saved for later"
- Grid các dự án đã bookmark
- Empty state nếu chưa có

#### CÁC NÚT:
- Project Card (click) → `/project/{id}`

#### TRANG TIẾP THEO:
- `/project/{id}` - Chi tiết dự án

---

### 8️⃣ **TRANG THU NHẬP (Earnings)**
**Route:** `/earnings`
**Truy cập:** Protected (phải đăng nhập)

#### NỘI DUNG TRANG:
- Header navigation
- Tiêu đề "Earnings & Withdrawals"
- Current Balance card
- Withdraw form
- Payment History
- Danh sách transactions

#### CÁC NÚT:
- "Withdraw Amount" input
- "Request Withdrawal" button → Submit rút tiền

#### FORM:
- Amount: number, min 0, max balance
- Submit action: `withdraw(amount)`
- Success: Toast + reload balance

#### TRANG TIẾP THEO:
- Không chuyển trang, reload data

---

### 9️⃣ **TRANG CÁ NHÂN (Profile)**
**Route:** `/profile`
**Truy cập:** Protected (phải đăng nhập)

#### NỘI DUNG TRANG:
- Header navigation
- Tiêu đề "Profile Settings"
- Avatar section với upload button
- Profile form (2 chế độ: đọc và edit)
- Connected Wallet section

#### CÁC NÚT:
- Upload icon button → Upload avatar
- "Edit Profile" button → Bật edit mode
- "Save Changes" button → Submit form
- "Cancel" button → Thoát edit mode

#### FORM:
**Avatar Upload:**
- File input (image/*, max 5MB)
- Auto-submit khi chọn

**Profile Form:**
- Username (text)
- Email (email)
- Bio (textarea)
- Connected Wallet (read-only)
- Submit action: `updateProfile()`

#### TRANG TIẾP THEO:
- Không chuyển trang, update tại chỗ

---

### 🔟 **TRANG TẠO DỰ ÁN MỚI (New Project)**
**Route:** `/project/new`
**Truy cập:** Protected (phải đăng nhập)

#### NỘI DUNG TRANG:
- Header navigation
- Tiêu đề "Submit Your Project"
- Subtitle "Share your idea and get valuable feedback from the community"
- Form tạo dự án đầy đủ

#### CÁC NÚT:
- "Create Project" button → Submit → `/project/{id}`
- "Cancel" button → Quay lại
- "Add" button (Tags) → Thêm tag
- "X" button (Tag item) → Xóa tag

#### FORM:
- Project Title: Required, 5-100 ký tự
- Description: Required, 50-5000 ký tự
- Demo URL: Optional, valid URL
- Category: Required, dropdown (8 categories)
- Tags: Required, 1-10 tags
- Bounty Amount: Required, 0-100000
- Deadline: Optional, date picker
- Status: Required, dropdown (Draft/Published/Archived)
- Submit action: `createProject(data)`
- Success: `/project/{id}`

#### TRANG TIẾP THEO:
- `/project/{id}` - Chi tiết dự án vừa tạo
- Trang trước (cancel)

---

### 1️⃣1️⃣ **TRANG CHI TIẾT DỰ ÁN (Project Detail)**
**Route:** `/project/{id}`
**Truy cập:** Public (tất cả người dùng)

#### NỘI DUNG TRANG:
- Header navigation
- Project Header Card:
  - Title, metadata (views, date, bounty)
  - Edit button (owner only)
  - Bookmark button
  - Start Livestream button (owner only)
  - Tags
  - Description
  - Demo link (nếu có)
- Livestream Section (nếu đang live)
- Feedback Section:
  - Số lượng feedback
  - "Give Feedback" button (user login, không phải owner)
  - Feedback form
  - Danh sách feedback cards với rating

#### CÁC NÚT:

**PROJECT HEADER:**
- "Edit" button (owner only) → `/project/{id}/edit`
- "Bookmark"/"Bookmarked" button → Toggle bookmark
- "Start Livestream" button (owner only) → `/project/{id}/livestream`
- "View Demo" link → Mở tab mới

**FEEDBACK SECTION:**
- "Give Feedback" button → Toggle form
- "Submit" button → Submit feedback
- "Cancel" button → Ẩn form
- "Add" button (Pros/Cons/Suggestions) → Thêm item
- "X" button → Xóa item
- Rating stars (1-5 stars) trên mỗi feedback card
- "Approve" button (owner only, trên feedback card) → Approve feedback
- "Reject" button (owner only, trên feedback card) → Reject feedback

#### FORM:
**Feedback Form:**
- Overall Feedback: Required, textarea
- Pros: Required, list (min 1)
- Cons: Required, list (min 1)
- Suggestions: Required, list (min 1)
- Quality Score: 1-5 stars rating
- Submit action: `createFeedback(projectId, data)`
- Success: Reload feedback list

#### TRANG TIẾP THEO:
- `/project/{id}/edit` - Chỉnh sửa dự án
- `/project/{id}/livestream` - Trang livestream
- `/browse` - Quay lại browse
- External URL - Demo link

---

### 1️⃣2️⃣ **TRANG CHỈNH SỬA DỰ ÁN (Edit Project)**
**Route:** `/project/{id}/edit`
**Truy cập:** Protected (owner only)

#### NỘI DUNG TRANG:
- Header navigation
- Tiêu đề "Edit Project"
- Subtitle "Update your project details"
- Form chỉnh sửa (pre-populated)

#### CÁC NÚT:
- "Update Project" button → Submit → `/project/{id}`
- "Cancel" button → Quay lại
- "Add" button (Tags) → Thêm tag
- "X" button (Tags) → Xóa tag

#### FORM:
- Giống New Project
- Submit button: "Update Project"
- Submit action: `updateProject(projectId, data)`
- Success: `/project/{id}`

#### TRANG TIẾP THEO:
- `/project/{id}` - Chi tiết dự án
- Trang trước (cancel)

---

### 1️⃣3️⃣ **TRANG LIVESTREAM (Livestream)**
**Route:** `/project/{id}/livestream`
**Truy cập:** Protected (owner only)

#### NỘI DUNG TRANG:
- Header navigation
- Tiêu đề "Livestream: [Project Name]"
- Video preview/camera feed
- Stream controls
- Chat box
- Viewer count
- Stream status indicator

#### CÁC NÚT:
- "Start Stream" button → Bắt đầu livestream
- "Stop Stream" button → Dừng livestream
- "End & Go Back" button → `/project/{id}`
- Camera toggle button → Bật/tắt camera
- Microphone toggle button → Bật/tắt mic
- Share screen button → Chia sẻ màn hình
- Chat send button → Gửi message vào chat

#### CHỨC NĂNG:
- Video streaming (WebRTC/Socket.io)
- Real-time chat
- Viewer count tracking
- Stream recording (optional)
- Submit action: `startLivestream(projectId)`
- Stop action: `stopLivestream(projectId)`

#### TRANG TIẾP THEO:
- `/project/{id}` - Quay lại chi tiết dự án
- `/project/{id}/stream/view` - Trang xem stream (cho viewers)

---

### 1️⃣4️⃣ **TRANG XEM LIVESTREAM (View Stream)**
**Route:** `/project/{id}/stream/view`
**Truy cập:** Public (tất cả người dùng)

#### NỘI DUNG TRANG:
- Header navigation
- Tiêu đề "Watching: [Project Name]"
- Video player (stream từ owner)
- Project info sidebar:
  - Title, description
  - Owner info
  - Tags
  - Bounty amount
- Chat box
- Viewer count
- Live indicator (red dot)

#### CÁC NÚT:
- "Back to Project" button → `/project/{id}`
- "Give Feedback" button → `/project/{id}` (scroll to feedback section)
- "Bookmark" button → Toggle bookmark
- Chat send button → Gửi message vào chat
- Fullscreen button → Fullscreen video
- Volume slider → Điều chỉnh âm lượng

#### CHỨC NĂNG:
- Watch livestream
- Real-time chat
- React với emoji
- Send messages
- Auto-refresh khi stream kết thúc

#### TRANG TIẾP THEO:
- `/project/{id}` - Chi tiết dự án (khi stream kết thúc hoặc click back)

---

### 1️⃣5️⃣ **TRANG CHẤM ĐIỂM FEEDBACK (Rate Feedback)**
**Route:** `/project/{id}/feedback/{feedbackId}/rate`
**Truy cập:** Protected (owner only)

#### NỘI DUNG TRANG:
- Header navigation
- Tiêu đề "Rate Feedback"
- Feedback content display:
  - Overall feedback
  - Pros list
  - Cons list
  - Suggestions list
- Rating section
- Action buttons

#### CÁC NÚT:
- "Approve" button → Approve feedback + distribute reward → `/project/{id}`
- "Reject" button → Reject feedback → `/project/{id}`
- "Back" button → `/project/{id}`
- Star rating (1-5 stars) → Đánh giá quality score

#### CHỨC NĂNG:
- Display full feedback content
- Rate quality (1-5 stars)
- Approve action: `approveFeedback(feedbackId, rating)`
- Reject action: `rejectFeedback(feedbackId)`
- Distribute bounty reward when approved
- Success: Update feedback status

#### TRANG TIẾP THEO:
- `/project/{id}` - Quay lại chi tiết dự án

---

## 📊 BẢNG TỔNG HỢP TẤT CẢ TRANG

| # | Tên trang | Route | Truy cập |
|---|-----------|-------|----------|
| 1 | Homepage | `/` | Public |
| 2 | Login | `/login` | Public |
| 3 | Register | `/register` | Public |
| 4 | Forgot Password | `/forgot-password` | Public |
| 5 | Dashboard | `/dashboard` | Protected |
| 6 | Browse Projects | `/browse` | Public |
| 7 | Bookmarks | `/bookmarks` | Protected |
| 8 | Earnings | `/earnings` | Protected |
| 9 | Profile | `/profile` | Protected |
| 10 | New Project | `/project/new` | Protected |
| 11 | Project Detail | `/project/{id}` | Public |
| 12 | Edit Project | `/project/{id}/edit` | Protected (owner) |
| 13 | Livestream | `/project/{id}/livestream` | Protected (owner) |
| 14 | View Stream | `/project/{id}/stream/view` | Public |
| 15 | Rate Feedback | `/project/{id}/feedback/{feedbackId}/rate` | Protected (owner) |

---

## 🔑 THAY ĐỔI NAVIGATION QUAN TRỌNG

### SAU KHI ĐĂNG NHẬP:
- Logo ở header → `/dashboard` (KHÔNG phải `/` nữa)
- Logo ở sidebar → `/dashboard`

### USER MENU DROPDOWN (Click vào Avatar):
- "Dashboard" → `/dashboard`
- "Profile Settings" → `/profile`
- "Connect Wallet" button → Modal kết nối ví
- (Separator line)
- "Logout" (với icon Exit) → Đăng xuất → `/`

### TÍNH NĂNG LIVESTREAM:
- Owner có thể bấm "Start Livestream" trên trang `/project/{id}`
- Chuyển đến `/project/{id}/livestream` để stream
- Viewers xem tại `/project/{id}/stream/view`
- Chat real-time cho cả owner và viewers

### TÍNH NĂNG CHẤM ĐIỂM FEEDBACK:
- Owner thấy buttons "Approve"/"Reject" trên mỗi feedback card
- Click "Approve" → Chuyển đến `/project/{id}/feedback/{feedbackId}/rate`
- Đánh giá quality score (1-5 stars)
- Approve → Distribute bounty reward
- Reject → Không phân phối reward

---

## 💡 LƯU Ý QUAN TRỌNG

### PROTECTED ROUTES (Cần đăng nhập):
- `/dashboard`
- `/bookmarks`
- `/earnings`
- `/profile`
- `/project/new`
- `/project/{id}/edit` (owner only)
- `/project/{id}/livestream` (owner only)
- `/project/{id}/feedback/{feedbackId}/rate` (owner only)

### PUBLIC ROUTES (Ai cũng truy cập được):
- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/browse`
- `/project/{id}`
- `/project/{id}/stream/view`

### OWNER-ONLY FEATURES:
- "Edit" button trên `/project/{id}`
- "Start Livestream" button trên `/project/{id}`
- "Approve"/"Reject" buttons trên feedback cards
- `/project/{id}/edit`
- `/project/{id}/livestream`
- `/project/{id}/feedback/{feedbackId}/rate`

### CONDITIONAL ELEMENTS:
- "Give Feedback" button - chỉ hiện cho user đã login, không phải owner
- "Start Livestream" button - chỉ owner thấy
- "Approve"/"Reject" buttons - chỉ owner thấy trên feedback cards
- Header navigation khác nhau giữa authenticated và unauthenticated
- Logo chuyển hướng khác nhau (đã login → `/dashboard`, chưa login → `/`)

---

## 📞 KẾT LUẬN

File này liệt kê **đầy đủ 15 trang** trong dự án Gimme Idea, với:
- ✅ Tất cả buttons và chức năng
- ✅ Chuyển hướng đến đâu
- ✅ Trang tiếp theo là gì
- ✅ Forms và validation
- ✅ Tính năng Livestream
- ✅ Tính năng Chấm điểm Feedback
- ✅ Navigation thay đổi sau khi login
- ✅ User menu dropdown với Connect Wallet

**BẠN CHỈ CẦN:** Thiết kế UI cho từng trang (màu sắc, kích thước, style)
**TÔI SẼ LÀM:** Implement logic, API calls, navigation, validation, livestream, rating system

**Sẵn sàng bắt đầu thiết kế!** 🚀
