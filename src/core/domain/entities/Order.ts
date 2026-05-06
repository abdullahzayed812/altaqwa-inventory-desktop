import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToMany } from 'typeorm';
import { Customer } from './Customer';
import { Driver } from './Driver';
import { OrderItem } from './OrderItem';

export enum OrderStatus {
    PENDING = 'PENDING',        // قيد الانتظار
    ASSIGNED = 'ASSIGNED',      // قيد التوصيل
    DELIVERED = 'DELIVERED',    // تم التسليم
    CANCELLED = 'CANCELLED',    // ملغي
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    orderNumber!: string;

    @ManyToOne(() => Customer, { eager: true })
    @JoinColumn({ name: 'customerId' })
    customer!: Customer;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    totalAmount!: number;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items!: OrderItem[];

    @Column({
        type: 'varchar',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status!: OrderStatus;

    @ManyToOne(() => Driver, { nullable: true, eager: true })
    @JoinColumn({ name: 'driverId' })
    assignedDriver!: Driver | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
