import { AppDataSource } from '../../infrastructure/database/sqliteRepositories';
import { Product } from '../../domain/entities/Product';
import { Order, OrderStatus } from '../../domain/entities/Order';

export class DashboardUseCases {
    private productRepository = AppDataSource.getRepository(Product);
    private orderRepository = AppDataSource.getRepository(Order);

    async getStats() {
        const products = await this.productRepository.find();
        const orders = await this.orderRepository.find({
            where: { status: OrderStatus.DELIVERED }
        });

        const totalSales = orders.reduce((acc, order) => acc + Number(order.totalAmount), 0);
        const lowStockCount = products.filter(p => p.stock < 10).length;

        // Simplified for this example
        const topProducts = products.sort((a, b) => b.stock - a.stock).slice(0, 5);

        // Get total customer debt
        const customers = await AppDataSource.getRepository('Customer').find() as any[];
        const totalDebt = customers.reduce((acc, c) => acc + Number(c.totalDebt), 0);

        // Get total payments (simplified)
        const payments = await AppDataSource.getRepository('Payment').find() as any[];
        const totalPayments = payments.reduce((acc, p) => acc + Number(p.amount), 0);

        return {
            totalSales,
            totalPayments,
            totalDebt,
            lowStockCount,
            topProducts,
            monthlySales: [] // Placeholder
        };
    }
}
