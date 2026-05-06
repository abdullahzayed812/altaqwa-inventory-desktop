import "reflect-metadata";
import { DataSource } from "typeorm";
import * as path from "path";
import { app } from "electron";

import { Product } from "../../core/domain/entities/Product";
import { Customer } from "../../core/domain/entities/Customer";
import { Order } from "../../core/domain/entities/Order";
import { OrderItem } from "../../core/domain/entities/OrderItem";
import { Driver } from "../../core/domain/entities/Driver";
import { Payment } from "../../core/domain/entities/Payment";
import { Supplier } from "../../core/domain/entities/Supplier";
import { Purchase } from "../../core/domain/entities/Purchase";
import { PurchaseItem } from "../../core/domain/entities/PurchaseItem";
import { SupplierPayment } from "../../core/domain/entities/SupplierPayment";
import { SupplierLedger } from "../../core/domain/entities/SupplierLedger";

// We don't set the database path here because app.getPath might fail before app is ready
export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: ":memory:", // Placeholder, will be overridden in initializeDatabase
  synchronize: true, // Use carefully in development
  logging: true,
  entities: [Product, Customer, Order, OrderItem, Driver, Payment, Supplier, Purchase, PurchaseItem, SupplierPayment, SupplierLedger],
  subscribers: [],
  migrations: [],
});

export const initializeDatabase = async () => {
  try {
    const dbPath = path.join(app.getPath("userData"), "agriculture_inventory.sqlite");
    console.log("Attempting to initialize database at:", dbPath);
    
    // Update the database path dynamically using setOptions
    AppDataSource.setOptions({ database: dbPath });

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source has been initialized successfully!");
    }
  } catch (err) {
    console.error("CRITICAL: Error during Data Source initialization", err);
    // In production, we might want to show a dialog or log to a file
    throw err; 
  }
};
