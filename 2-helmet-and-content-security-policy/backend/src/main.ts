// Entry point — bootstrap NestJS, áp dụng Helmet với CSP nonce callback
// (EN: Entry point — bootstrap NestJS, apply Helmet with CSP nonce callback)
import { NestFactory } from "@nestjs/core"
import { ConfigService } from "@nestjs/config"
import { AppModule } from "./app.module"
import helmet from "helmet"
import { Response } from "express"

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule)
    const config = app.get(ConfigService)

    // Đọc cổng và chế độ CSP từ config
    // (EN: Read port and CSP mode from config)
    const port: number = config.get<number>("app.port") ?? 3000
    const cspReportOnly: boolean = config.get<boolean>("app.cspReportOnly") ?? true

    // Bật body parser cho application/csp-report để nhận báo cáo vi phạm từ browser
    // (EN: Enable body parser for application/csp-report to receive violation reports from browsers)
    app.use(
        require("express").json({
            type: ["application/json", "application/csp-report"],
        }),
    )

    // Helmet với CSP nonce per-request
    // Middleware CspNonceMiddleware đã gán res.locals.cspNonce trước khi Helmet chạy
    // (EN: Helmet with per-request CSP nonce
    // CspNonceMiddleware has already set res.locals.cspNonce before Helmet runs)
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    // default-src giới hạn mọi resource về 'self'
                    // (EN: default-src restricts all resources to 'self')
                    defaultSrc: ["'self'"],

                    // script-src: chỉ cho phép script có nonce khớp — KHÔNG dùng 'unsafe-inline'
                    // (EN: script-src: only allow scripts with a matching nonce — NO 'unsafe-inline')
                    scriptSrc: [
                        "'self'",
                        // Callback được Helmet gọi mỗi request — đọc nonce từ res.locals
                        // (EN: Callback invoked by Helmet on every request — reads nonce from res.locals)
                        (_req: unknown, res: unknown): string =>
                            `'nonce-${(res as Response).locals.cspNonce}'`,
                    ],

                    // object-src: chặn plugin Flash/Java
                    // (EN: object-src: block Flash/Java plugins)
                    objectSrc: ["'none'"],

                    // report-uri: browser gửi vi phạm về endpoint này
                    // (EN: report-uri: browser sends violations to this endpoint)
                    reportUri: "/csp-report",
                },
                // report-only hoặc enforce tuỳ thuộc vào env var CSP_REPORT_ONLY
                // (EN: report-only or enforce depending on CSP_REPORT_ONLY env var)
                reportOnly: cspReportOnly,
            },

            // Bật HSTS: 1 năm, bao gồm subdomain
            // (EN: Enable HSTS: 1 year, include subdomains)
            strictTransportSecurity: {
                maxAge: 31536000,
                includeSubDomains: true,
            },

            // Đặt X-Frame-Options: SAMEORIGIN — chặn clickjacking từ frame ngoài
            // (EN: Set X-Frame-Options: SAMEORIGIN — blocks clickjacking from external frames)
            frameguard: { action: "sameorigin" },

            // Ẩn X-Powered-By — không tiết lộ framework backend
            // (EN: Hide X-Powered-By — do not disclose the backend framework)
            hidePoweredBy: true,
        }),
    )

    await app.listen(port)
    console.log(`Server running on http://localhost:${port}`)
    console.log(`CSP mode: ${cspReportOnly ? "report-only" : "enforce"}`)
    console.log(`Verify headers: curl -I http://localhost:${port}/`)
    console.log(`CSP nonce demo: http://localhost:${port}/demo`)
}

bootstrap()
