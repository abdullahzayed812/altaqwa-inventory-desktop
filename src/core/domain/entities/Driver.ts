import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('drivers')
export class Driver {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 255 })
    name!: string;

    @Column({ length: 50, nullable: true })
    phone!: string;

    @Column({ length: 100, nullable: true })
    vehiclePlate!: string;

    @Column({ length: 100, nullable: true })
    vehicleDetails!: string;

    @Column({ type: 'boolean', default: true })
    isAvailable!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
