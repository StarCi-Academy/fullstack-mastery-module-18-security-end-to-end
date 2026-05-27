import { Injectable } from '@nestjs/common'
import * as xss from 'xss'

// VI: kiểu dữ liệu cho đơn hàng
// (EN: order data type)
export interface Order {
  id: number
  comment: string
}

// VI: service quản lý đơn hàng, áp dụng output encoding để phòng XSS
// (EN: orders service managing orders with output encoding to prevent XSS)
@Injectable()
export class OrdersService {
  private orders: Order[] = []
  private nextId = 1

  // VI: tạo đơn hàng mới — làm sạch comment trước khi lưu
  // (EN: create a new order — sanitize comment before storing)
  create(rawComment: string): Order {
    const safeComment = xss.filterXSS(rawComment)
    const order: Order = { id: this.nextId++, comment: safeComment }
    this.orders.push(order)
    return order
  }

  // VI: lấy tất cả đơn hàng
  // (EN: retrieve all orders)
  findAll(): Order[] {
    return this.orders
  }
}
