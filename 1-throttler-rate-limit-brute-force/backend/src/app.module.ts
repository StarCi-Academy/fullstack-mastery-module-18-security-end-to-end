import { Module } from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { ThrottlerModule } from "@nestjs/throttler"
import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis"
import { Redis } from "ioredis"
import { appConfig, redisConfig, type RedisConfig } from "./config"
import { AuthModule } from "./auth"
import { ProductsModule } from "./products"
import { IpEmailThrottlerGuard } from "./common/guards"

/**
 * AppModule — module gốc khởi tạo ThrottlerModule với hai throttler đặt tên và Redis storage.
 * (EN: AppModule — root module that initialises ThrottlerModule with two named throttlers and Redis storage.)
 *
 * Hai throttler:
 * - `short`: 10 req / 10 s — áp dụng toàn cục cho route public.
 * - `auth`:   5 req / 60 s — override riêng trên POST /auth/login chống brute-force.
 * (EN: Two throttlers:
 * - `short`: 10 req / 10 s — applied globally to public routes.
 * - `auth`:   5 req / 60 s — overridden specifically on POST /auth/login against brute-force.)
 *
 * APP_GUARD đăng ký IpEmailThrottlerGuard toàn cục — mọi controller bị bảo vệ mặc định.
 * Opt-out: dùng @SkipThrottle().
 * (EN: APP_GUARD registers IpEmailThrottlerGuard globally — every controller is protected by default.
 * Opt-out: use @SkipThrottle().)
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig, redisConfig],
        }),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => {
                // Lấy Redis config từ ConfigService để khởi tạo ioredis client.
                // (EN: Pull Redis config from ConfigService to instantiate the ioredis client.)
                const r = cfg.getOrThrow<RedisConfig>("redis")
                const redis = new Redis({ host: r.host, port: r.port })

                return {
                    throttlers: [
                        // Throttler ngắn cho endpoint public — chặn scraper và hot-loop vô tình.
                        // (EN: Short throttler for public endpoints — blocks scrapers and accidental hot-loops.)
                        { name: "short", ttl: 10_000, limit: 10 },
                        // Throttler xác thực — giới hạn chặt chống brute-force login.
                        // (EN: Auth throttler — strict limit to block brute-force login attempts.)
                        { name: "auth", ttl: 60_000, limit: 5 },
                    ],
                    // Redis storage đảm bảo counter đồng bộ qua nhiều replica.
                    // (EN: Redis storage ensures counters are synchronised across replicas.)
                    storage: new ThrottlerStorageRedisService(redis),
                }
            },
        }),
        AuthModule,
        ProductsModule,
    ],
    providers: [
        {
            // Đăng ký guard tùy chỉnh toàn cục — tracker key = ip:email.
            // (EN: Register custom guard globally — tracker key = ip:email.)
            provide: APP_GUARD,
            useClass: IpEmailThrottlerGuard,
        },
    ],
})
export class AppModule {}
