import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './Order';
import { Product } from './Product';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    orderId!: number;

    @ManyToOne(() => Order, (order) => order.items)
    order!: Order;

    @Column()
    productId!: number;

    @ManyToOne(() => Product)
    product!: Product;

    @Column({ type: 'int' })
    quantity!: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    price!: number;
}
