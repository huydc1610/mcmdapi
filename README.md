# MDMC Aggregated API

API gộp thông tin người dùng (`profile`, `ranking`, v.v.) và thông số (`stats`) từ 2 endpoint của MDMC:
- `https://api.mdmc.moe/v3/users/:number`
- `https://api.mdmc.moe/v3/users/:number/stats`

---

## 🚀 Cách chạy

1. Cài đặt thư viện:
```bash
npm install
```

2. Khởi chạy server:
```bash
npm start
# hoặc chạy chế độ phát triển (tự reload khi sửa code):
npm run dev
```

Server mặc định chạy tại: `http://localhost:3000`

---

## 📡 Các endpoint hỗ trợ

- `GET /users/:number`
- `GET /api/users/:number`
- `GET /v3/users/:number`

Với `:number` là ID người dùng (ví dụ: `1` hoặc `35,755` - API tự động loại bỏ dấu phẩy/chấm/khoảng cách để chuẩn hóa thành `35755`).

### 1. Định dạng mặc định (Gộp `stats` vào thông tin user)
**Yêu cầu:**
```http
GET http://localhost:3000/users/1
```

**Phản hồi:**
```json
{
  "profile": { ... },
  "ranking": { ... },
  "uid": 1,
  "discordId": "373657230530052099",
  "username": "AshtonMemer",
  "banned": false,
  "isReviewer": true,
  "isLeadReviewer": true,
  "isModerator": true,
  "id": "670b5e01984eb9b7a3470de3",
  "stats": {
    "totalScores": 60,
    "perfectScores": 8,
    "topScores": 0,
    "averageAccuracy": 95.48349898333332
  }
}
```

### 2. Định dạng tách biệt (`?format=nested`)
**Yêu cầu:**
```http
GET http://localhost:3000/users/1?format=nested
```

**Phản hồi:**
```json
{
  "user": { ... },
  "stats": { ... }
}
```
