// (EN: Vault config namespace registered with ConfigModule)
// (VI: namespace cấu hình Vault đăng ký với ConfigModule)
import { registerAs } from "@nestjs/config"

export const vaultConfig = registerAs("vault", () => ({
    // (EN: Vault server address — read from env)
    // (VI: địa chỉ Vault server — đọc từ env)
    addr: process.env.VAULT_ADDR ?? "http://localhost:8200",
}))
