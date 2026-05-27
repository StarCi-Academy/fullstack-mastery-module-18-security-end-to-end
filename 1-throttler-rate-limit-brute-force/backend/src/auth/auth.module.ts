import { Module } from "@nestjs/common"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"

/**
 * AuthModule — đăng ký controller và service xác thực.
 * (EN: AuthModule — registers the authentication controller and service.)
 */
@Module({
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
