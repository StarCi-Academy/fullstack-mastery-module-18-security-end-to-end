import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { AppModule } from "./app.module"
import type { AppConfig } from "./config"

/**
 * Bootstrap NestJS trên port 3000 với CORS bật và ValidationPipe toàn cục.
 * (EN: Bootstrap the NestJS app on port 3000 with CORS enabled and a global ValidationPipe.)
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule)

    // ValidationPipe bắt buộc — strip field lạ, reject unknown, auto-coerce primitive.
    // (EN: Mandatory ValidationPipe — strip unknown fields, reject extra, auto-coerce primitives.)
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    )

    // Prefix phiên bản — FE gọi http://localhost:3000/api/v1/<endpoint>.
    // (EN: Version prefix — FE calls http://localhost:3000/api/v1/<endpoint>.)
    app.setGlobalPrefix("api/v1")
    app.enableCors()

    const cfg = app.get(ConfigService)
    const port = cfg.get<AppConfig>("app")?.port ?? 3000
    await app.listen(port)
}

void bootstrap()
