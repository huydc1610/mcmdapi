import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_MDMC_URL = 'https://api.mdmc.moe/v3/users';

app.use(cors());
app.use(express.json());

// Helper handler to aggregate user profile and stats
async function handleUserRequest(req, res) {
  let number = req.params.number || req.query.number || req.query.uid;

  // Xóa dấu (dấu phẩy, dấu chấm, khoảng trắng) nếu có, ví dụ: "35,755" -> "35755"
  if (typeof number === 'string') {
    number = number.replace(/[,.\s]/g, '');
  }

  if (!number || !/^\d+$/.test(number)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Tham số number phải là số nguyên dương hợp lệ.'
    });
  }

  try {
    const userUrl = `${BASE_MDMC_URL}/${number}`;
    const statsUrl = `${BASE_MDMC_URL}/${number}/stats`;

    // Gọi đồng thời 2 API để tối ưu tốc độ phản hồi
    const [userRes, statsRes] = await Promise.all([
      fetch(userUrl),
      fetch(statsUrl)
    ]);

    // Nếu không tìm thấy người dùng (404)
    if (userRes.status === 404) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Không tìm thấy user với id/number ${number}`
      });
    }

    if (!userRes.ok) {
      return res.status(userRes.status).json({
        error: 'Upstream Error',
        message: `Lỗi khi lấy thông tin user từ MDMC (HTTP ${userRes.status})`
      });
    }

    const userData = await userRes.json();
    const statsData = statsRes.ok ? await statsRes.json() : null;

    // Đảm bảo xóa dấu ở giá trị uid nếu có (ví dụ: "35,755" -> 35755)
    if (userData && userData.uid !== undefined && userData.uid !== null) {
      if (typeof userData.uid === 'string') {
        const cleanedUid = userData.uid.replace(/[,.\s]/g, '');
        userData.uid = /^\d+$/.test(cleanedUid) ? Number(cleanedUid) : cleanedUid;
      }
    }

    // Gộp dữ liệu: thêm object 'stats' vào thông tin user
    // Nếu có query param ?format=nested, trả về dạng { user: ..., stats: ... }
    if (req.query.format === 'nested') {
      return res.json({
        user: userData,
        stats: statsData
      });
    }

    const mergedData = {
      ...userData,
      stats: statsData
    };

    return res.json(mergedData);
  } catch (error) {
    console.error(`Lỗi khi xử lý user ${number}:`, error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

// Hỗ trợ nhiều tiền tố route phổ biến
app.get('/users/:number', handleUserRequest);
app.get('/v3/users/:number', handleUserRequest);
app.get('/api/users/:number', handleUserRequest);
app.get('/user/:number', handleUserRequest);
app.get('/api/user/:number', handleUserRequest);
app.get('/users', handleUserRequest);
app.get('/api/users', handleUserRequest);

// Endpoint kiểm tra server hoạt động
app.get(['/', '/api'], (req, res) => {
  res.json({
    name: 'MDMC Aggregated API',
    status: 'online',
    example: `/users/1 hoặc /api/users/1`
  });
});

// Export app cho các nền tảng serverless như Vercel
export default app;

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log(`Ví dụ: http://localhost:${PORT}/users/1`);
  });
}

