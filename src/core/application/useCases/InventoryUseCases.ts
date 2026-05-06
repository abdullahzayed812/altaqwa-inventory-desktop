import { AppDataSource } from '../../infrastructure/database/sqliteRepositories';
import { Product } from '../../domain/entities/Product';

export class InventoryUseCases {
    private repository = AppDataSource.getRepository(Product);

    async getAllProducts() {
        return this.repository.find({ order: { createdAt: 'DESC' } });
    }

    async addProduct(data: Partial<Product>) {
        const product = this.repository.create(data);
        return this.repository.save(product);
    }

    async updateStock(id: number, quantity: number) {
        const product = await this.repository.findOneBy({ id });
        if (!product) throw new Error('Product not found');
        product.stock += quantity;
        return this.repository.save(product);
    }
}
