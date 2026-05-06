import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Purchase } from './Purchase';
import { Product } from './Product';

@Entity('purchase_items')
export class PurchaseItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    purchaseId!: number;

    @ManyToOne(() => Purchase, (purchase) => purchase.items)
    purchase!: Purchase;

    @Column()
    productId!: number;

    @ManyToOne(() => Product)
    product!: Product;

    @Column({ type: 'int' })
    quantity!: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    price!: number;
}
