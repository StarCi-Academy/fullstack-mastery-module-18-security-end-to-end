import { IsEmail, IsString, MinLength } from "class-validator"

/**
 * DTO đăng nhập — email + password tối thiểu 6 ký tự.
 * (EN: Login DTO — email + password with minimum 6 characters.)
 */
export class LoginDto {
    @IsEmail()
    email: string = ""

    @IsString()
    @MinLength(6)
    password: string = ""
}
