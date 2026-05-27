// Module gốc — kết nối ConfigModule, CspNonceMiddleware, các controller
// (EN: Root module — wires ConfigModule, CspNonceMiddleware, and controllers)
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { appConfig } from "./config"
import { AppController } from "./app"
import { CspNonceMiddleware, CspReportController } from "./csp"

@Module({
    imports: [
        // ConfigModule load .env và expose config factory appConfig
        // (EN: ConfigModule loads .env and exposes the appConfig factory)
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig],
        }),
    ],
    controllers: [
        // Controller demo CSP nonce
        // (EN: Demo CSP nonce controller)
        AppController,

        // Controller nhận báo cáo vi phạm CSP từ trình duyệt
        // (EN: Controller receiving CSP violation reports from browsers)
        CspReportController,
    ],
})
export class AppModule implements NestModule {
    // Đăng ký CspNonceMiddleware trước mọi route để nonce luôn có trước khi Helmet chạy
    // (EN: Register CspNonceMiddleware before all routes so the nonce is set before Helmet runs)
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(CspNonceMiddleware).forRoutes("*")
    }
}
