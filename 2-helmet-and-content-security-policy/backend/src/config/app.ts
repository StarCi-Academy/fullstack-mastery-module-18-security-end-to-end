// Cấu hình ứng dụng — đọc biến môi trường và cung cấp qua ConfigModule
// (EN: Application config — reads environment variables and exposes them via ConfigModule)
import { registerAs } from "@nestjs/config"

export default registerAs("app", () => ({
    // Cổng lắng nghe
    // (EN: Listen port)
    port: parseInt(process.env.APP_PORT ?? "3000", 10),

    // Chế độ CSP: true = report-only, false = enforce
    // (EN: CSP mode: true = report-only, false = enforce)
    cspReportOnly: process.env.CSP_REPORT_ONLY === "true",
}))
