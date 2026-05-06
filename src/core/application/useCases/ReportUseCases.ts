import { AppDataSource } from '../../infrastructure/database/sqliteRepositories';
import { Order, OrderStatus } from '../../domain/entities/Order';
import { Payment } from '../../domain/entities/Payment';

export class ReportUseCases {
    private orderRepository = AppDataSource.getRepository(Order);
    private paymentRepository = AppDataSource.getRepository(Payment);

    async getReportData() {
        // Sales report (excluding cancelled)
        const orders = await this.orderRepository.find({
            where: { status: OrderStatus.DELIVERED },
            relations: ['customer']
        });

        const recentSales = orders.map(o => ({
            date: o.createdAt,
            total: o.totalAmount,
            customer: o.customer?.name
        }));

        // Customer balances
        const customerRepository = AppDataSource.getRepository('Customer');
        const customerBalances = await customerRepository.find();

        return {
            recentSales,
            customerBalances
        };
    }
}
