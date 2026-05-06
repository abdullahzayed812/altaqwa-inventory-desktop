import { AppDataSource } from '../../infrastructure/database/sqliteRepositories';
import { Driver } from '../../domain/entities/Driver';

export class DriverUseCases {
    private repository = AppDataSource.getRepository(Driver);

    async getAllDrivers() {
        return this.repository.find({ order: { createdAt: 'DESC' } });
    }

    async addDriver(data: Partial<Driver>) {
        const driver = this.repository.create(data);
        return this.repository.save(driver);
    }

    async updateAvailability(id: number, isAvailable: boolean) {
        const driver = await this.repository.findOneBy({ id });
        if (!driver) throw new Error('Driver not found');
        driver.isAvailable = isAvailable;
        return this.repository.save(driver);
    }
}
