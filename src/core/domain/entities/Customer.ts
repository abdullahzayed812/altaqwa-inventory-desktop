import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 255 })
    name!: string;

    @Column({ length: 50, nullable: true })
    phone!: string;

    @Column({ type: 'text', nullable: true })
    address!: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    totalDebt!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
