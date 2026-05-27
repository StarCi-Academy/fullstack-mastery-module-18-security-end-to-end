import { registerAs } from '@nestjs/config'

// VI: cấu hình ứng dụng được đọc từ biến môi trường
// (EN: application config loaded from environment variables)
export default registerAs('app', () => ({
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  allowedOrigins: (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:3001').split(','),
}))
