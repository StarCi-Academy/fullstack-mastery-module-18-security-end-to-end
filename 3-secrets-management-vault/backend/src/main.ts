// (EN: application entrypoint — Vault AppRole login must complete before HTTP server starts)
// (VI: điểm vào ứng dụng — AppRole login Vault phải hoàn thành trước khi HTTP server start)
import "reflect-metadata"
import { NestFactory } from "@nestjs/core"
import { Logger } from "@nestjs/common"
import { AppModule } from "./app.module"
import { vaultLoader } from "./config"

const logger = new Logger("Bootstrap")

async function bootstrap(): Promise<void> {
    // (EN: Step 1 — authenticate to Vault via AppRole and fetch DB_PASSWORD into process memory)
    // (VI: Bước 1 — xác thực với Vault qua AppRole và fetch DB_PASSWORD vào process memory)
    // (EN: if this throws, the app crashes immediately — fail-fast by design)
    // (VI: nếu throw, app crash ngay — fail-fast theo thiết kế)
    logger.log("Authenticating to Vault via AppRole...")
    const secrets = await vaultLoader()

    // (EN: Step 2 — inject secrets into process.env so ConfigModule.forRoot() can read them)
    // (VI: Bước 2 — inject secrets vào process.env để ConfigModule.forRoot() có thể đọc)
    process.env["DB_PASSWORD"] = secrets.DB_PASSWORD
    process.env["VAULT_TOKEN_TTL"] = String(secrets.VAULT_TOKEN_TTL)

    logger.log("Vault authenticated via AppRole")

    // (EN: Step 3 — create NestJS application; Vault secrets are already in memory)
    // (VI: Bước 3 — tạo ứng dụng NestJS; Vault secrets đã có trong memory)
    const app = await NestFactory.create(AppModule)

    const port = parseInt(process.env["PORT"] ?? "3000", 10)

    // (EN: Step 4 — start listening only after Vault secrets are loaded)
    // (VI: Bước 4 — bắt đầu listen chỉ sau khi Vault secrets đã được load)
    await app.listen(port)
    logger.log(`Application listening on port ${port}`)
}

// (EN: unhandled rejection propagates the crash — do not add a global catch here)
// (VI: rejection không xử lý sẽ crash process — không thêm global catch ở đây)
bootstrap()
