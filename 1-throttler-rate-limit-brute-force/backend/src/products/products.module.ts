import { Module } from "@nestjs/common"
import { ProductsController } from "./products.controller"

/**
 * ProductsModule — cung cấp endpoint GET /products để demo throttle.
 * (EN: ProductsModule — provides GET /products endpoint for throttle demo.)
 */
@Module({
    controllers: [ProductsController],
})
export class ProductsModule {}
