import { Controller, Get, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'

// VI: controller cung cấp endpoint lấy CSRF token cho client
// (EN: controller providing the CSRF token retrieval endpoint for clients)
@Controller('csrf-token')
export class CsrfController {
  @Get()
  getCsrfToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): { csrfToken: string } {
    // VI: đọc token từ res.locals (được đặt bởi CsrfMiddleware) hoặc từ cookie đã parse
    // (EN: read token from res.locals (set by CsrfMiddleware) or from the parsed cookie)
    const token =
      (res.locals['csrfToken'] as string | undefined) ??
      (req.cookies['csrf-token'] as string | undefined) ??
      ''
    return { csrfToken: token }
  }
}
