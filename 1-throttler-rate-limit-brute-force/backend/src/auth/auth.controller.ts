import {
    Body,
    Controller,
    Post,
} from "@nestjs/common"
import { Throttle } from "@nestjs/throttler"
import { AuthService } from "./auth.service"
import { LoginDto } from "./dto"

/**
 * AuthController — xử lý xác thực, áp throttle `auth` chặt hơn throttle mặc định.
 * (EN: AuthController — handles authentication with a stricter `auth` throttle on login.)
 *
 * Route POST /auth/login bị giới hạn 5 lần / 60 giây per tracker key (ip:email).
 * (EN: POST /auth/login is limited to 5 attempts / 60 s per tracker key (ip:email).)
 */
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * Đăng nhập — trả JWT stub nếu credential đúng, 401 nếu sai, 429 khi vượt ngưỡng.
     * (EN: Login — returns a stub JWT on valid credentials, 401 on mismatch, 429 when throttled.)
     */
    @Throttle({ auth: { limit: 5, ttl: 60_000 } })
    @Post("login")
    async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
        return this.authService.login(dto)
    }
}
