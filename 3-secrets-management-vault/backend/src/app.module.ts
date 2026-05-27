// (EN: root application module — imports ConfigModule with Vault secrets pre-loaded)
// (VI: module gốc của ứng dụng — import ConfigModule với Vault secrets đã được load sẵn)
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { appConfig, vaultConfig } from "./config"
import { VaultModule } from "./vault"
import { SecretsController } from "./secrets"

@Module({
    imports: [
        // (EN: ConfigModule loads Vault secrets as a custom loader — secrets are already in memory by bootstrap)
        // (VI: ConfigModule load Vault secrets qua custom loader — secrets đã có trong memory lúc bootstrap)
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig, vaultConfig],
        }),
        VaultModule,
    ],
    controllers: [SecretsController],
})
export class AppModule {}
