import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { InventoryPage } from './features/inventory/InventoryPage';
import { CustomersPage } from './features/customers/CustomersPage';
import { CustomerDetailsPage } from './features/customers/CustomerDetailsPage';
import { OrdersPage } from './features/orders/OrdersPage';
import { DriversPage } from './features/drivers/DriversPage';
import { DriverDetailsPage } from './features/drivers/DriverDetailsPage';
import { PaymentsPage } from './features/payments/PaymentsPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { SuppliersPage } from './features/suppliers/SuppliersPage';
import { SupplierDetailsPage } from './features/suppliers/SupplierDetailsPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailsPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="suppliers/:id" element={<SupplierDetailsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="drivers/:id" element={<DriverDetailsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
