// Controller nhận vi phạm CSP từ trình duyệt và ghi log ở mức warn
// (EN: Controller that receives CSP violations from browsers and logs them at warn level)
import {
    Controller,
    Post,
    Body,
    HttpCode,
    Headers,
    Logger,
} from "@nestjs/common"

// Kiểu payload vi phạm CSP từ browser
// (EN: Type for the CSP violation payload from the browser)
interface CspReportBody {
    "csp-report"?: {
        "document-uri"?: string
        "violated-directive"?: string
        "blocked-uri"?: string
    }
    // Một số browser gửi flat payload thay vì nested
    // (EN: Some browsers send a flat payload instead of a nested one)
    "document-uri"?: string
    "violated-directive"?: string
    "blocked-uri"?: string
}

@Controller("csp-report")
export class CspReportController {
    private readonly logger = new Logger(CspReportController.name)

    // Nhận POST /csp-report, log 3 trường quan trọng, trả 204
    // (EN: Receive POST /csp-report, log 3 key fields, return 204)
    @Post()
    @HttpCode(204)
    logReport(
        @Body() body: CspReportBody,
        @Headers("user-agent") userAgent: string,
    ): void {
        // Browser có thể wrap trong csp-report hoặc gửi flat
        // (EN: Browser may wrap in csp-report object or send flat payload)
        const report = body["csp-report"] ?? body

        this.logger.warn({
            documentUri: report["document-uri"],
            violatedDirective: report["violated-directive"],
            blockedUri: report["blocked-uri"],
            userAgent,
        })
    }
}
