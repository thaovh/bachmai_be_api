# BM Backend

Backend chuẩn hóa sử dụng NestJS, PostgreSQL, Oracle (dynamic query), CQRS, JWT, Swagger, logging, audit log, phân trang, rate limiting.

---

## **Tính năng nổi bật**

- NestJS framework, kiến trúc module chuẩn
- PostgreSQL (TypeORM, soft delete, UUID, migration)
- CQRS pattern (command, query, event sourcing)
- JWT + refresh token, bảo mật endpoint
- Dynamic query với Oracle 12c (truy vấn động, validate param, phân trang)
- Swagger API docs
- Logging, audit log, standardized error response
- Rate limiting, phân trang chuẩn hóa

---

## **Yêu cầu cài đặt**

- Node.js >= 16
- npm >= 8
- PostgreSQL
- Oracle 12c (nếu dùng dynamic query)
- Python 3 (bắt buộc để cài oracledb)
- Cài đặt Oracle Instant Client (tham khảo: https://oracle.github.io/node-oracledb/INSTALL.html)

---

## **Cài đặt & khởi động**

### 1. Clone source code
```bash
git clone <repository-url>
cd bm_backend
```

### 2. Cài dependencies
```bash
npm install
```

### 3. Tạo file `.env` ở thư mục gốc, ví dụ:
```env
# PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=bm_backend

# Oracle (dynamic query)
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_USER=your_oracle_user
ORACLE_PASSWORD=your_oracle_password
ORACLE_SERVICE_NAME=your_service_name

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-secret-key
REFRESH_TOKEN_EXPIRES_IN=7d

# App
PORT=3000
NODE_ENV=development

# Rate limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### 4. Chạy migration & seed dữ liệu mẫu
```bash
npm run migration:run
```

### 5. Khởi động ứng dụng
```bash
# Chạy dev
npm run start:dev

# Build & chạy production
npm run build
npm run start:prod
```

---

## **API Documentation**

- Truy cập Swagger tại:  
  [http://localhost:3000/api](http://localhost:3000/api)

---

## **Dynamic Query (Truy vấn động Oracle)**

### **Thiết kế bảng**
- Bảng: `dynamic_queries`
  - `id` (UUID), `name` (unique), `sql` (text), `params_schema` (JSON string), `description` (text), `created_at`, `updated_at`

### **Seed mẫu**
```sql
INSERT INTO dynamic_queries (id, name, sql, params_schema, description, created_at, updated_at)
VALUES (
  uuid_generate_v4(),
  'getDepartment',
  'SELECT ID, Name FROM DEPARTMENT WHERE (:ID IS NULL OR ID = :ID)',
  '[{"name":"ID","type":"number","required":false}]',
  'Lấy thông tin phòng ban theo ID (ID không bắt buộc)',
  now(),
  now()
);
```

### **Gọi endpoint động**
- **Endpoint:** `POST /dynamic-query/:name` (bảo vệ JWT)
- **Body mẫu:**
  ```json
  {
    "params": {
      "ID": 123
    },
    "page": 1,
    "limit": 10
  }
  ```
  - Nếu không muốn lọc theo ID, truyền `"ID": null` hoặc bỏ qua trường này.

- **Response mẫu:**
  ```json
  {
    "items": [
      { "ID": 123, "NAME": "Phòng Kế Toán" }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
  ```

- **Lưu ý:**  
  - Endpoint này yêu cầu JWT (Authorization: Bearer <token>).
  - Mọi truy vấn động đều được ghi lại audit log (ai, truy vấn gì, params, ip, user-agent).

---

## **Cấu trúc thư mục**

```
src/
├── auth/                 # Xác thực, JWT, refresh token
├── users/                # Quản lý người dùng
├── dynamic-query/        # Dynamic query Oracle
├── common/               # Tiện ích chung, logging, audit log, constants
├── config/               # Cấu hình
├── database/             # Entities, migrations, seed
└── shared/               # CQRS commands, queries, events
```

---

## **Một số lệnh hữu ích**

- Chạy migration:  
  `npm run migration:run`
- Tạo migration mới:  
  `npm run migration:generate -- -n <migration-name>`
- Chạy test:  
  `npm test`

---

## **Ghi chú**

- Nếu dùng dynamic query với Oracle, cần cài đặt Oracle Instant Client và cấu hình biến môi trường đúng.
- Mọi endpoint động đều được bảo vệ JWT và ghi lại audit log.
- Để thêm truy vấn động mới, chỉ cần insert vào bảng `dynamic_queries` với schema params phù hợp.

---

## **License**

MIT

---

Nếu bạn cần hướng dẫn chi tiết hơn về dynamic query, audit log, hoặc gặp lỗi khi cài đặt, hãy liên hệ team phát triển hoặc xem thêm trong source code!
