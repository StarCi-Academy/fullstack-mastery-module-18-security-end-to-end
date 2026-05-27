// (EN: VaultModule — registers VaultRefreshService as a provider and exports it)
// (VI: VaultModule — đăng ký VaultRefreshService là provider và export ra ngoài)
import { Module } from "@nestjs/common"
import { VaultRefreshService } from "./vault-refresh.service"

@Module({
    providers: [VaultRefreshService],
    exports: [VaultRefreshService],
})
export class VaultModule {}
