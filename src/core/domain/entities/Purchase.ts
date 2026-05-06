import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Supplier } from './Supplier';
import { PurchaseItem } from './PurchaseItem';

@Entity('purchases')
export class Purchase {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    supplierId!: number;

    @ManyToOne(() => Supplier)
    supplier!: Supplier;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    totalAmount!: number;

    @OneToMany(() => PurchaseItem, (item) => item.purchase, { cascade: true })
    items!: PurchaseItem[];

    @CreateDateColumn()
    createdAt!: Date;
}
