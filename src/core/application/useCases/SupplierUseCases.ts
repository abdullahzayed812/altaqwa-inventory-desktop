import { AppDataSource } from '../../infrastructure/database/sqliteRepositories';
import { Supplier } from '../../domain/entities/Supplier';
import { Purchase } from '../../domain/entities/Purchase';
import { PurchaseItem } from '../../domain/entities/PurchaseItem';
import { SupplierPayment } from '../../domain/entities/SupplierPayment';
import { SupplierLedger, SupplierLedgerType } from '../../domain/entities/SupplierLedger';
import { Product } from '../../domain/entities/Product';

export class SupplierUseCases {
    private supplierRepo = AppDataSource.getRepository(Supplier);
    private purchaseRepo = AppDataSource.getRepository(Purchase);
    private paymentRepo = AppDataSource.getRepository(SupplierPayment);
    private ledgerRepo = AppDataSource.getRepository(SupplierLedger);
    private productRepo = AppDataSource.getRepository(Product);

    async getAllSuppliers() {
        return this.supplierRepo.find({ order: { name: 'ASC' } });
    }

    async getSupplierById(id: number) {
        return this.supplierRepo.findOneBy({ id });
    }

    async addSupplier(data: Partial<Supplier>) {
        const supplier = this.supplierRepo.create(data);
        return this.supplierRepo.save(supplier);
    }

    async createPurchase(data: { supplierId: number, items: { productId: number, quantity: number, price: number }[] }) {
        return AppDataSource.transaction(async (transactionalEntityManager) => {
            let totalAmount = 0;
            data.items.forEach(item => {
                totalAmount += item.quantity * item.price;
            });

            // 1. Create Purchase
            const purchase = transactionalEntityManager.create(Purchase, {
                supplierId: data.supplierId,
                totalAmount
            });
            const savedPurchase = await transactionalEntityManager.save(purchase);

            // 2. Create Purchase Items & Update Stock
            for (const item of data.items) {
                const purchaseItem = transactionalEntityManager.create(PurchaseItem, {
                    purchaseId: savedPurchase.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                });
                await transactionalEntityManager.save(purchaseItem);

                // Update Stock
                const product = await transactionalEntityManager.findOneBy(Product, { id: item.productId });
                if (product) {
                    product.stock += item.quantity;
                    await transactionalEntityManager.save(product);
                }
            }

            // 3. Create Ledger Entry
            const ledgerEntry = transactionalEntityManager.create(SupplierLedger, {
                supplierId: data.supplierId,
                type: SupplierLedgerType.PURCHASE,
                amount: totalAmount,
                referenceId: savedPurchase.id
            });
            await transactionalEntityManager.save(ledgerEntry);

            // 4. Update Supplier Balance
            const supplier = await transactionalEntityManager.findOneBy(Supplier, { id: data.supplierId });
            if (supplier) {
                supplier.totalBalance = Number(supplier.totalBalance) + totalAmount;
                await transactionalEntityManager.save(supplier);
            }

            return savedPurchase;
        });
    }

    async addPayment(data: { supplierId: number, amount: number, note?: string }) {
        return AppDataSource.transaction(async (transactionalEntityManager) => {
            // 1. Create Payment
            const payment = transactionalEntityManager.create(SupplierPayment, {
                supplierId: data.supplierId,
                amount: data.amount,
                note: data.note
            });
            const savedPayment = await transactionalEntityManager.save(payment);

            // 2. Create Ledger Entry
            const ledgerEntry = transactionalEntityManager.create(SupplierLedger, {
                supplierId: data.supplierId,
                type: SupplierLedgerType.PAYMENT,
                amount: data.amount,
                referenceId: savedPayment.id
            });
            await transactionalEntityManager.save(ledgerEntry);

            // 3. Update Supplier Balance
            const supplier = await transactionalEntityManager.findOneBy(Supplier, { id: data.supplierId });
            if (supplier) {
                supplier.totalBalance = Number(supplier.totalBalance) - data.amount;
                await transactionalEntityManager.save(supplier);
            }

            return savedPayment;
        });
    }

    async getLedger(supplierId: number) {
        return this.ledgerRepo.find({
            where: { supplierId },
            order: { createdAt: 'DESC' }
        });
    }

    async getAllPayments() {
        return this.paymentRepo.find({
            relations: ['supplier'],
            order: { createdAt: 'DESC' }
        });
    }
}
