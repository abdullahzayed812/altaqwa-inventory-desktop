import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Supplier } from './Supplier';

export enum SupplierLedgerType {
    PURCHASE = 'PURCHASE',
    PAYMENT = 'PAYMENT'
}

@Entity('supplier_ledger')
export class SupplierLedger {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    supplierId!: number;

    @ManyToOne(() => Supplier)
    supplier!: Supplier;

    @Column({
        type: 'varchar',
        length: 20
    })
    type!: SupplierLedgerType;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount!: number;

    @Column({ nullable: true })
    referenceId!: number; // ID of Purchase or SupplierPayment

    @CreateDateColumn()
    createdAt!: Date;
}
