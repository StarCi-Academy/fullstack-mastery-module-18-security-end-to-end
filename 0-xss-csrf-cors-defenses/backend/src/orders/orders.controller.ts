import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { OrdersService, Order } from './orders.service'

// VI: DTO cho request tạo đơn hàng
// (EN: DTO for create order request)
interface CreateOrderDto {
  comment: string
}

// VI: controller quản lý các route đơn hàng
// (EN: controller handling order routes)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // VI: POST /orders — yêu cầu CSRF token hợp lệ (kiểm tra bởi CsrfMiddleware)
  // (EN: POST /orders — requires valid CSRF token (enforced by CsrfMiddleware))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateOrderDto): Order {
    return this.ordersService.create(dto.comment ?? '')
  }

  // VI: GET /orders — trả danh sách đơn hàng đã được encode an toàn
  // (EN: GET /orders — returns orders with safely encoded content)
  @Get()
  findAll(): Order[] {
    return this.ordersService.findAll()
  }
}
