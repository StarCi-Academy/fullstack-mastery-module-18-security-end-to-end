import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { appConfig } from './config'
import { CsrfController, CsrfMiddleware } from './csrf'
import { OrdersModule } from './orders'

// VI: root module của ứng dụng — đăng ký config, CSRF và orders
// (EN: application root module — registers config, CSRF, and orders)
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    OrdersModule,
  ],
  controllers: [CsrfController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // VI: áp dụng CSRF middleware cho tất cả các route
    // (EN: apply CSRF middleware to all routes)
    consumer.apply(CsrfMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    })
  }
}
