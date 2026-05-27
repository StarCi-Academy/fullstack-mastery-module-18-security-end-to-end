import { Injectable, UnauthorizedException } from "@nestjs/common"
import type { LoginDto } from "./dto"

/**
 * AuthService — kiểm tra credential demo (hard-coded user duy nhất).
 * Trong production, thay bằng lookup DB + bcrypt.compare().
 * (EN: AuthService — verifies demo credentials (single hard-coded user).
 * In production, replace with DB lookup + bcrypt.compare().)
 */
@Injectable()
export class AuthService {
    /**
     * Xác thực email + password và trả JWT stub nếu đúng.
     * (EN: Validate email + password and return a stub JWT on success.)
     */
    async login(dto: LoginDto): Promise<{ accessToken: string }> {
        // Demo: chỉ chấp nhận admin@demo.com / password123.
        // (EN: Demo: only accepts admin@demo.com / password123.)
        const DEMO_EMAIL = "admin@demo.com"
        const DEMO_PASSWORD = "password123"

        if (dto.email !== DEMO_EMAIL || dto.password !== DEMO_PASSWORD) {
            throw new UnauthorizedException("Invalid credentials")
        }

        // Trả stub token — production phải dùng @nestjs/jwt.
        // (EN: Return stub token — production must use @nestjs/jwt.)
        return { accessToken: "stub-jwt-token" }
    }
}
