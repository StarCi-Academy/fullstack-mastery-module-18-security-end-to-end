import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import * as crypto from 'crypto'

// VI: các phương thức HTTP an toàn (không thay đổi trạng thái)
// (EN: safe HTTP methods that do not mutate state)
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // VI: đọc token từ cookie hiện tại
    // (EN: read token from the current cookie)
    const cookieToken = req.cookies['csrf-token'] as string | undefined

    if (SAFE_METHODS.includes(req.method)) {
      // VI: với GET/HEAD/OPTIONS — sinh cookie mới nếu chưa tồn tại
      // (EN: for GET/HEAD/OPTIONS — set a new cookie if not present)
      if (!cookieToken) {
        const token = crypto.randomBytes(32).toString('hex')
        res.cookie('csrf-token', token, {
          sameSite: 'lax',
          // VI: đặt secure: true khi deploy production HTTPS
          // (EN: set secure: true when deploying to production HTTPS)
          secure: false,
          httpOnly: false,
          path: '/',
        })
        // VI: lưu token vào res.locals để controller đọc được trong cùng request
        // (EN: store token in res.locals so the controller can read it in the same request)
        res.locals['csrfToken'] = token
      } else {
        // VI: cookie đã tồn tại, chuyển cho controller qua locals
        // (EN: cookie already exists, forward to controller via locals)
        res.locals['csrfToken'] = cookieToken
      }
      return next()
    }

    // VI: với POST/PUT/DELETE/PATCH — kiểm tra double-submit
    // (EN: for POST/PUT/DELETE/PATCH — enforce double-submit check)
    const headerToken = req.headers['x-csrf-token']
    if (
      !cookieToken ||
      !headerToken ||
      cookieToken !== headerToken
    ) {
      throw new ForbiddenException('CSRF token mismatch')
    }
    next()
  }
}
