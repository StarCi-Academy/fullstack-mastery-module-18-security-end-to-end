import { Module } from '@nestjs/common'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'

// VI: module đơn hàng — đăng ký controller và service
// (EN: orders module — registers controller and service)
@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
