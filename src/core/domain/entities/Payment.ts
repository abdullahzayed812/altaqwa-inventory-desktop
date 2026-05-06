import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Customer } from './Customer';

export enum PaymentMethod {
    CASH = 'CASH',          // كاش
    BANK_TRANSFER = 'BANK', // تحويل بنكي
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Customer, { eager: true })
    @JoinColumn({ name: 'customerId' })
    customer!: Customer;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount!: number;

    @Column({
        type: 'varchar',
        enum: PaymentMethod,
        default: PaymentMethod.CASH,
    })
    method!: PaymentMethod;

    @Column({ length: 255, nullable: true })
    notes!: string;

    @CreateDateColumn()
    createdAt!: Date;
}
