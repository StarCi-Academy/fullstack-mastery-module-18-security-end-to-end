// Middleware sinh CSP nonce cryptographically secure mỗi request
// (EN: Middleware that generates a cryptographically secure CSP nonce on every request)
import { Injectable, NestMiddleware } from "@nestjs/common"
import { Request, Response, NextFunction } from "express"
import crypto from "node:crypto"

@Injectable()
export class CspNonceMiddleware implements NestMiddleware {
    // Sinh nonce 128-bit ngẫu nhiên, lưu vào res.locals để helmet callback đọc
    // (EN: Generate a random 128-bit nonce, store in res.locals for the helmet callback to read)
    use(_req: Request, res: Response, next: NextFunction): void {
        res.locals.cspNonce = crypto.randomBytes(16).toString("base64")
        next()
    }
}
