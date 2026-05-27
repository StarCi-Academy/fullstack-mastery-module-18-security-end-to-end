import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import { ConfigService } from '@nestjs/config'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)

  // VI: lấy danh sách origin được phép từ cấu hình
  // (EN: retrieve allowed origins from config)
  const allowedOrigins = configService.get<string[]>('app.allowedOrigins') ?? [
    'http://localhost:3001',
  ]

  // VI: cấu hình CORS nghiêm ngặt — chỉ cho phép origin trong danh sách trắng
  // (EN: strict CORS configuration — only allow origins in the allowlist)
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // VI: cho phép server-to-server request (không có Origin header)
      // (EN: allow server-to-server requests that carry no Origin header)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        // VI: trả về false để CORS middleware từ chối, không throw Error
        // (EN: return false to let the CORS middleware reject, do not throw Error)
        callback(null, false)
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  })

  // VI: đăng ký cookie-parser để đọc cookie trong request
  // (EN: register cookie-parser to read cookies from requests)
  app.use(cookieParser())

  const port = configService.get<number>('app.port') ?? 3000
  await app.listen(port)
  console.log(`Application is running on: http://localhost:${port}`)
}

bootstrap().catch(console.error)
