// (EN: background service that refreshes Vault secrets at TTL/3 interval)
// (VI: service nền làm mới Vault secrets tại interval TTL/3)
import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { vaultLoader } from "../config"

// (EN: internal type alias for ConfigService internal store — NestJS does not expose a public mutator)
// (VI: type alias cho internal store của ConfigService — NestJS không expose public mutator)
type ConfigInternal = Record<string, (key: string, value: unknown) => void>

@Injectable()
export class VaultRefreshService implements OnModuleInit {
    private readonly logger = new Logger(VaultRefreshService.name)

    // (EN: ISO timestamp recorded when the secret was last successfully loaded)
    // (VI: ISO timestamp ghi lúc secret được load thành công lần cuối)
    private loadedAt: string = new Date().toISOString()

    constructor(private readonly configService: ConfigService) {}

    // (EN: get the timestamp when DB_PASSWORD was last loaded from Vault)
    // (VI: lấy timestamp khi DB_PASSWORD được load từ Vault lần cuối)
    getLoadedAt(): string {
        return this.loadedAt
    }

    onModuleInit(): void {
        // (EN: read TTL set by vaultLoader at bootstrap; default to 3600s if missing)
        // (VI: đọc TTL được vaultLoader set lúc bootstrap; mặc định 3600s nếu không có)
        const ttl = this.configService.get<number>("VAULT_TOKEN_TTL") ?? 3600

        // (EN: interval = max(60s, TTL/3) — prevents interval under 1 minute in short-TTL dev envs)
        // (VI: interval = max(60s, TTL/3) — tránh interval dưới 1 phút trong môi trường dev TTL ngắn)
        const intervalMs = Math.max(60_000, (ttl * 1000) / 3)

        this.logger.log(`Vault refresh interval: ${intervalMs}ms (ttl=${ttl}s)`)

        setInterval(async () => {
            try {
                // (EN: re-authenticate and fetch fresh secrets from Vault)
                // (VI: xác thực lại và fetch secrets mới từ Vault)
                const fresh = await vaultLoader()

                // (EN: update ConfigService internal store — hack required since NestJS has no public set())
                // (VI: cập nhật internal store của ConfigService — hack cần thiết vì NestJS không có public set())
                const internalConfig = this.configService as unknown as ConfigInternal
                if (typeof internalConfig["set"] === "function") {
                    internalConfig["set"]("DB_PASSWORD", fresh.DB_PASSWORD)
                    internalConfig["set"]("VAULT_TOKEN_TTL", fresh.VAULT_TOKEN_TTL)
                }

                this.loadedAt = new Date().toISOString()
                this.logger.log("vault.secrets.refreshed")
            } catch (err) {
                // (EN: graceful degradation — log warn, keep cached secret, do not crash)
                // (VI: graceful degradation — log warn, giữ secret cache, không crash)
                this.logger.warn({ err }, "vault.refresh.failed")
            }
        }, intervalMs)
    }

    // (EN: manually trigger a refresh — used by POST /debug/refresh)
    // (VI: trigger refresh thủ công — dùng bởi POST /debug/refresh)
    async triggerRefresh(): Promise<{ ok: boolean; error?: string }> {
        try {
            const fresh = await vaultLoader()
            const internalConfig = this.configService as unknown as ConfigInternal
            if (typeof internalConfig["set"] === "function") {
                internalConfig["set"]("DB_PASSWORD", fresh.DB_PASSWORD)
                internalConfig["set"]("VAULT_TOKEN_TTL", fresh.VAULT_TOKEN_TTL)
            }
            this.loadedAt = new Date().toISOString()
            this.logger.log("vault.secrets.refreshed (manual)")
            return { ok: true }
        } catch (err) {
            const error = err instanceof Error ? err.message : String(err)
            this.logger.warn({ err }, "vault.refresh.failed (manual)")
            return { ok: false, error }
        }
    }
}
