import { AppDataSource } from '../../infrastructure/database/sqliteRepositories';
import { Payment } from '../../domain/entities/Payment';
import { Customer } from '../../domain/entities/Customer';

export class PaymentUseCases {
    private repository = AppDataSource.getRepository(Payment);
    private customerRepository = AppDataSource.getRepository(Customer);

    async getAllPayments() {
        return this.repository.find({ order: { createdAt: 'DESC' } });
    }

    async addPayment(data: Partial<Payment> & { customerId: number }) {
        const customer = await this.customerRepository.findOneBy({ id: data.customerId });
        if (!customer) throw new Error('Customer not found');

        const payment = this.repository.create({
            ...data,
            customer
        });

        // Deduct amount from customer debt
        customer.totalDebt = Number(customer.totalDebt) - Number(data.amount);
        await this.customerRepository.save(customer);

        return this.repository.save(payment);
    }
}
