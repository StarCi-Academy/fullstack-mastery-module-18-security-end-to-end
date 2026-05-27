// (EN: SecretsController — exposes debug endpoints for fingerprint and manual refresh)
// (VI: SecretsController — expose debug endpoints cho fingerprint và refresh thủ công)
import { Controller, Get, Post, Query } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { createHash } from "crypto"
import { VaultRefreshService } from "../vault"

// (EN: response shape for fingerprint endpoint)
// (VI: kiểu response cho fingerprint endpoint)
interface FingerprintResponse {
    fingerprint: string
    loadedAt: string
}

// (EN: response shape for manual refresh endpoint)
// (VI: kiểu response cho manual refresh endpoint)
interface RefreshResponse {
    ok: boolean
    error?: string
}

@Controller("debug")
export class SecretsController {
    constructor(
        private readonly configService: ConfigService,
        private readonly vaultRefresh: VaultRefreshService,
    ) {}

    // (EN: GET /debug/db-pass-fingerprint — returns first 16 hex chars of SHA-256(DB_PASSWORD))
    // (VI: GET /debug/db-pass-fingerprint — trả 16 hex đầu của SHA-256(DB_PASSWORD))
    @Get("db-pass-fingerprint")
    getFingerprint(): FingerprintResponse {
        const password = this.configService.get<string>("DB_PASSWORD") ?? ""

        // (EN: compute SHA-256 fingerprint — never expose raw password in response)
        // (VI: tính SHA-256 fingerprint — không bao giờ expose raw password trong response)
        const fingerprint = createHash("sha256").update(password).digest("hex").slice(0, 16)

        return {
            fingerprint,
            loadedAt: this.vaultRefresh.getLoadedAt(),
        }
    }

    // (EN: POST /debug/refresh — triggers a manual Vault secret refresh)
    // (VI: POST /debug/refresh — trigger refresh Vault secret thủ công)
    @Post("refresh")
    async triggerRefresh(): Promise<RefreshResponse> {
        return this.vaultRefresh.triggerRefresh()
    }

    // (EN: GET /debug/health — simple liveness check)
    // (VI: GET /debug/health — kiểm tra liveness đơn giản)
    @Get("health")
    health(): { status: string } {
        return { status: "ok" }
    }
}
