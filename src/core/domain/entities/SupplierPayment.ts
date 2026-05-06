import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Supplier } from './Supplier';

@Entity('supplier_payments')
export class SupplierPayment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    supplierId!: number;

    @ManyToOne(() => Supplier)
    supplier!: Supplier;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount!: number;

    @Column({ nullable: true })
    note!: string;

    @CreateDateColumn()
    createdAt!: Date;
}
