import { AppDataSource } from '../../infrastructure/database/sqliteRepositories';
import { Customer } from '../../domain/entities/Customer';

export class CustomerUseCases {
    private repository = AppDataSource.getRepository(Customer);

    async getAllCustomers() {
        return this.repository.find({ order: { createdAt: 'DESC' } });
    }

    async addCustomer(data: Partial<Customer>) {
        const customer = this.repository.create(data);
        return this.repository.save(customer);
    }

    async updateDebt(id: number, amount: number) {
        const customer = await this.repository.findOneBy({ id });
        if (!customer) throw new Error('Customer not found');
        customer.totalDebt = Number(customer.totalDebt) + amount;
        return this.repository.save(customer);
    }
}
