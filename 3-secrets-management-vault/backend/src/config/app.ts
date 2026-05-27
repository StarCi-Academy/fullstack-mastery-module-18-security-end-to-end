// (EN: application-level config registered with ConfigModule)
// (VI: cấu hình cấp ứng dụng đăng ký với ConfigModule)
import { registerAs } from "@nestjs/config"

export const appConfig = registerAs("app", () => ({
    // (EN: HTTP port — defaults to 3000)
    // (VI: cổng HTTP — mặc định 3000)
    port: parseInt(process.env.PORT ?? "3000", 10),
}))
