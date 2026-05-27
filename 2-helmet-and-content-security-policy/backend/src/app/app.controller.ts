// Controller minh hoạ CSP nonce: route /demo trả HTML với hai inline script
// (EN: Demo controller — /demo route returns HTML with two inline scripts to illustrate nonce enforcement)
import { Controller, Get, Req, Res } from "@nestjs/common"
import { Request, Response } from "express"

@Controller()
export class AppController {
    // Route /demo: script có nonce được phép, script thiếu nonce bị chặn (enforce) hoặc log (report-only)
    // (EN: /demo route: script with nonce is allowed; script without nonce is blocked (enforce) or logged (report-only))
    @Get("demo")
    demo(@Req() req: Request, @Res() res: Response): void {
        // Lấy nonce từ res.locals — được gán bởi CspNonceMiddleware
        // (EN: Read the nonce from res.locals — set by CspNonceMiddleware)
        const nonce = (res.locals as Record<string, string>).cspNonce ?? ""

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CSP Nonce Demo</title>
</head>
<body>
  <h1>CSP Nonce Demo</h1>
  <p>Open DevTools Console to see the results.</p>

  <!-- Script có nonce khớp — được phép chạy -->
  <!-- (EN: Script with matching nonce — allowed to execute) -->
  <script nonce="${nonce}">
    console.log('[ALLOWED] inline script with nonce ran successfully')
  </script>

  <!-- Script thiếu nonce — bị chặn (enforce) hoặc ghi vào log vi phạm (report-only) -->
  <!-- (EN: Script without nonce — blocked (enforce) or logged as violation (report-only)) -->
  <script>
    console.log('[BLOCKED] this should not appear in enforce mode')
  </script>
</body>
</html>`

        res.setHeader("Content-Type", "text/html")
        res.send(html)
    }

    // Route gốc trả JSON để dễ curl kiểm tra header CSP
    // (EN: Root route returns JSON for easy curl header inspection)
    @Get()
    root(): Record<string, string> {
        return { status: "ok", hint: "Check the CSP header above. Visit /demo for nonce illustration." }
    }
}
