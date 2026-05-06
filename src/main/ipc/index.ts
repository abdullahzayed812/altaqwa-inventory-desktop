import { ipcMain, dialog } from "electron";
import * as fs from "fs";
import { InventoryUseCases } from "../../core/application/useCases/InventoryUseCases";
import { CustomerUseCases } from "../../core/application/useCases/CustomerUseCases";
import { OrderUseCases } from "../../core/application/useCases/OrderUseCases";
import { DriverUseCases } from "../../core/application/useCases/DriverUseCases";
import { PaymentUseCases } from "../../core/application/useCases/PaymentUseCases";
import { DashboardUseCases } from "../../core/application/useCases/DashboardUseCases";
import { ReportUseCases } from "../../core/application/useCases/ReportUseCases";
import { SupplierUseCases } from "../../core/application/useCases/SupplierUseCases";
import { SeedUseCases } from "../../core/application/useCases/SeedUseCases";
import { PrintService } from "../services/PrintService";
import { generateBackupFileName } from "../services/BackupService";
import { AppDataSource } from "../database/dataSource";

export function setupIpcHandlers() {
  const inventory = new InventoryUseCases();
  const customers = new CustomerUseCases();
  const orders = new OrderUseCases();
  const drivers = new DriverUseCases();
  const payments = new PaymentUseCases();
  const dashboard = new DashboardUseCases();
  const reports = new ReportUseCases();
  const suppliers = new SupplierUseCases();
  const seeder = new SeedUseCases();

  PrintService.init();

  // Backup
  ipcMain.handle("backup:export", async () => {
    const sourcePath = AppDataSource.options.database as string;
    const suggestedName = generateBackupFileName("app-backup", ".sqlite");

    const { filePath, canceled } = await dialog.showSaveDialog({
      title: "حفظ نسخة احتياطية",
      defaultPath: suggestedName,
      filters: [{ name: "SQLite Database", extensions: ["sqlite", "db"] }],
    });

    if (canceled || !filePath) return { success: false };

    await fs.promises.copyFile(sourcePath, filePath);
    return { success: true, filePath };
  });

  // Dashboard
  ipcMain.handle("get-dashboard-stats", () => dashboard.getStats());

  // Reports
  ipcMain.handle("get-report-data", () => reports.getReportData());

  // Inventory
  ipcMain.handle("get-products", () => inventory.getAllProducts());
  ipcMain.handle("add-product", (_, data) => inventory.addProduct(data));
  ipcMain.handle("update-stock", (_, id, qty) => inventory.updateStock(id, qty));

  // Customers
  ipcMain.handle("get-customers", () => customers.getAllCustomers());
  ipcMain.handle("add-customer", (_, data) => customers.addCustomer(data));

  // Orders
  ipcMain.handle("get-orders", () => orders.getAllOrders());
  ipcMain.handle("create-order", (_, data) => orders.createOrder(data));
  ipcMain.handle("assign-driver", (_, orderId, driverId) => orders.assignDriver(orderId, driverId));
  ipcMain.handle("update-order-status", (_, orderId, status) => orders.updateStatus(orderId, status));

  // Drivers
  ipcMain.handle("get-drivers", () => drivers.getAllDrivers());
  ipcMain.handle("add-driver", (_, data) => drivers.addDriver(data));
  ipcMain.handle("update-driver-status", (_, id, isAvailable) => drivers.updateAvailability(id, isAvailable));

  // Payments
  ipcMain.handle("get-payments", () => payments.getAllPayments());
  ipcMain.handle("add-payment", (_, data) => payments.addPayment(data));

  // Suppliers
  ipcMain.handle("get-suppliers", () => suppliers.getAllSuppliers());
  ipcMain.handle("add-supplier", (_, data) => suppliers.addSupplier(data));
  ipcMain.handle("get-supplier-by-id", (_, id) => suppliers.getSupplierById(id));
  ipcMain.handle("create-purchase", (_, data) => suppliers.createPurchase(data));
  ipcMain.handle("add-supplier-payment", (_, data) => suppliers.addPayment(data));
  ipcMain.handle("get-supplier-ledger", (_, id) => suppliers.getLedger(id));
  ipcMain.handle("get-all-supplier-payments", () => suppliers.getAllPayments());

  // Seeding
  ipcMain.handle("db:seed", () => seeder.seed());
}
