import { AppDataSource } from '../../infrastructure/database/sqliteRepositories';
import { Product } from '../../domain/entities/Product';
import { Customer } from '../../domain/entities/Customer';
import { Supplier } from '../../domain/entities/Supplier';

export class SeedUseCases {
    async seed() {
        return AppDataSource.transaction(async (manager) => {
            // 1. Seed Products
            const productRepo = manager.getRepository(Product);
            const products = [
                { name: 'تقاوي قمح - صنف جيزة 171', price: 450, stock: 100 },
                { name: 'تقاوي ذرة صفراء - هجين 3080', price: 850, stock: 50 },
                { name: 'سماد يوريا 46%', price: 600, stock: 200 },
                { name: 'سوبر فوسفات ناعم', price: 250, stock: 150 },
                { name: 'مبيد حشري - لمبادا', price: 120, stock: 80 },
                { name: 'نترات نشادر 33.5%', price: 580, stock: 120 },
            ];

            for (const p of products) {
                const exists = await productRepo.findOneBy({ name: p.name });
                if (!exists) {
                    await productRepo.save(productRepo.create(p));
                }
            }

            // 2. Seed Customers
            const customerRepo = manager.getRepository(Customer);
            const customers = [
                { name: 'الحاج إبراهيم محمد', phone: '01012345678', address: 'المنوفية - أشمون' },
                { name: 'مزرعة الوادي الحديثة', phone: '01198765432', address: 'طريق مصر إسكندرية الصحراوي' },
                { name: 'مكتب الهدى للتوريدات', phone: '01234567890', address: 'الغربية - طنطا' },
            ];

            for (const c of customers) {
                const exists = await customerRepo.findOneBy({ name: c.name });
                if (!exists) {
                    await customerRepo.save(customerRepo.create(c));
                }
            }

            // 3. Seed Suppliers
            const supplierRepo = manager.getRepository(Supplier);
            const suppliers = [
                { name: 'الشركة المصرية للأسمدة', phone: '0223456789', address: 'القاهرة - مدينة نصر' },
                { name: 'شركة النيل للتقاوي والزراعة', phone: '0234567890', address: 'الجيزة - الدقي' },
                { name: 'دلتا للمبيدات الكيماوية', phone: '0403344556', address: 'المنطقة الصناعية - قويسنا' },
            ];

            for (const s of suppliers) {
                const exists = await supplierRepo.findOneBy({ name: s.name });
                if (!exists) {
                    await supplierRepo.save(supplierRepo.create(s));
                }
            }

            return { success: true };
        });
    }
}
