import { AppDataSource } from '../../infrastructure/database/sqliteRepositories';
import { Order, OrderStatus } from '../../domain/entities/Order';
import { OrderItem } from '../../domain/entities/OrderItem';
import { Customer } from '../../domain/entities/Customer';
import { Product } from '../../domain/entities/Product';

export class OrderUseCases {
    private repository = AppDataSource.getRepository(Order);
    private customerRepository = AppDataSource.getRepository(Customer);

    async getAllOrders() {
        return this.repository.find({ 
            relations: ['items', 'items.product', 'customer', 'assignedDriver'],
            order: { createdAt: 'DESC' } 
        });
    }

    async createOrder(data: { customerId: number, totalAmount: number, items: { productId: number, quantity: number, price: number }[] }) {
        return AppDataSource.transaction(async (transactionalEntityManager) => {
            const customer = await transactionalEntityManager.findOneBy(Customer, { id: data.customerId });
            if (!customer) throw new Error('Customer not found');

            // 1. Create Order
            const order = transactionalEntityManager.create(Order, {
                customer,
                totalAmount: data.totalAmount,
                status: OrderStatus.PENDING,
                orderNumber: `ORD-${Date.now().toString().slice(-4)}`
            });
            const savedOrder = await transactionalEntityManager.save(order);

            // 2. Create Order Items & Reduce Stock
            for (const item of data.items) {
                const orderItem = transactionalEntityManager.create(OrderItem, {
                    orderId: savedOrder.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                });
                await transactionalEntityManager.save(orderItem);

                // Reduce Stock
                const product = await transactionalEntityManager.findOneBy(Product, { id: item.productId });
                if (product) {
                    if (product.stock < item.quantity) {
                        throw new Error(`Inssuficient stock for product: ${product.name}`);
                    }
                    product.stock -= item.quantity;
                    await transactionalEntityManager.save(product);
                }
            }

            // 3. Add amount to customer debt
            customer.totalDebt = Number(customer.totalDebt) + Number(data.totalAmount);
            await transactionalEntityManager.save(customer);

            return savedOrder;
        });
    }

    async updateStatus(id: number, status: OrderStatus) {
        return AppDataSource.transaction(async (transactionalEntityManager) => {
            const order = await transactionalEntityManager.findOne(Order, { 
                where: { id },
                relations: ['items', 'items.product', 'customer']
            });
            if (!order) throw new Error('Order not found');

            const oldStatus = order.status;
            
            // If already cancelled, do nothing
            if (oldStatus === OrderStatus.CANCELLED) return order;

            order.status = status;

            // Handle Cancellation logic
            if (status === OrderStatus.CANCELLED) {
                // 1. Release Stock
                for (const item of order.items) {
                    const product = await transactionalEntityManager.findOneBy(Product, { id: item.productId });
                    if (product) {
                        product.stock += item.quantity;
                        await transactionalEntityManager.save(product);
                    }
                }

                // 2. Deduct from customer debt
                const customer = order.customer;
                if (customer) {
                    customer.totalDebt = Number(customer.totalDebt) - Number(order.totalAmount);
                    await transactionalEntityManager.save(customer);
                }
            }

            return transactionalEntityManager.save(order);
        });
    }

    async assignDriver(orderId: number, driverId: number) {
        const order = await this.repository.findOneBy({ id: orderId });
        if (!order) throw new Error('Order not found');
        order.assignedDriver = { id: driverId } as any;
        order.status = OrderStatus.ASSIGNED;
        return this.repository.save(order);
    }
}
