import { Controller, Get } from "@nestjs/common"

/**
 * ProductsController — endpoint public demo cho throttle test.
 * Áp throttle `short` mặc định từ APP_GUARD (10 req / 10 s).
 * (EN: ProductsController — public demo endpoint for throttle testing.
 * Uses the default `short` throttle from APP_GUARD (10 req / 10 s).)
 */
@Controller("products")
export class ProductsController {
    /**
     * Trả danh sách sản phẩm giả — để kiểm chứng throttle flow 1.
     * (EN: Return a mock product list — used to verify throttle flow 1.)
     */
    @Get()
    findAll(): Array<{ id: number; name: string }> {
        return [
            { id: 1, name: "Widget A" },
            { id: 2, name: "Widget B" },
            { id: 3, name: "Widget C" },
        ]
    }
}
