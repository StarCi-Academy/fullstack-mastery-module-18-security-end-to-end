import { Injectable } from "@nestjs/common"
import { ThrottlerGuard } from "@nestjs/throttler"
import type { Request } from "express"

/**
 * Guard throttle tùy chỉnh — tracker key là tổ hợp `ip:email` để chống credential stuffing.
 * (EN: Custom throttler guard — tracker key is composite `ip:email` to defeat credential stuffing.)
 *
 * Lý do tổ hợp ip:email quan trọng hơn per-IP đơn thuần:
 * - Per-IP đơn: attacker có botnet 10 000 IP, mỗi IP gửi 4 req → 40 000 thử/phút không bị chặn.
 * - ip:email: mỗi cặp (IP, email) bị giới hạn riêng, buộc attacker cần nhiều IP lẫn nhiều email.
 * (EN: Why composite is stronger than per-IP alone:
 * - Per-IP only: botnet of 10 000 IPs each sends 4 req → 40 000 tries/min slip through.
 * - ip:email: each (IP, email) pair is throttled independently, forcing attacker to rotate both.)
 */
@Injectable()
export class IpEmailThrottlerGuard extends ThrottlerGuard {
    /**
     * Trả về tracker key tổ hợp `ip:email` từ request body.
     * (EN: Return composite tracker key `ip:email` from the request body.)
     */
    protected async getTracker(req: Request): Promise<string> {
        // Lấy email từ body — fallback về "anon" nếu không có.
        // (EN: Extract email from body — fallback to "anon" when absent.)
        const body = req.body as Record<string, unknown>
        const email = typeof body?.["email"] === "string" ? body["email"] : "anon"
        return `${req.ip}:${email}`
    }
}
