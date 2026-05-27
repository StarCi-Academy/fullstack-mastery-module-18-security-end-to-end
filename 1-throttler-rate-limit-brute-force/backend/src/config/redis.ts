import { registerAs } from "@nestjs/config"

/**
 * Cấu hình kết nối Redis cho ThrottlerStorageRedis — single source of truth env vars.
 * (EN: Redis connection config for ThrottlerStorageRedis — single source of truth for env vars.)
 */
export interface RedisConfig {
    host: string
    port: number
}

export default registerAs("redis", (): RedisConfig => ({
    host: process.env.REDIS_HOST ?? "localhost",
    port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
}))
