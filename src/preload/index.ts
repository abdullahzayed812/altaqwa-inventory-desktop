import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    inventory: {
        getProducts: () => ipcRenderer.invoke('get-products'),
        addProduct: (data: any) => ipcRenderer.invoke('add-product', data),
        updateStock: (id: number, qty: number) => ipcRenderer.invoke('update-stock', id, qty),
    },
    customers: {
        getCustomers: () => ipcRenderer.invoke('get-customers'),
        addCustomer: (data: any) => ipcRenderer.invoke('add-customer', data),
    },
    orders: {
        getOrders: () => ipcRenderer.invoke('get-orders'),
        createOrder: (data: any) => ipcRenderer.invoke('create-order', data),
        assignDriver: (orderId: number, driverId: number) => ipcRenderer.invoke('assign-driver', orderId, driverId),
        updateStatus: (orderId: number, status: string) => ipcRenderer.invoke('update-order-status', orderId, status),
    },
    drivers: {
        getDrivers: () => ipcRenderer.invoke('get-drivers'),
        addDriver: (data: any) => ipcRenderer.invoke('add-driver', data),
        updateStatus: (id: number, isAvailable: boolean) => ipcRenderer.invoke('update-driver-status', id, isAvailable),
    },
    payments: {
        getPayments: () => ipcRenderer.invoke('get-payments'),
        addPayment: (data: any) => ipcRenderer.invoke('add-payment', data),
    },
    suppliers: {
        getSuppliers: () => ipcRenderer.invoke('get-suppliers'),
        addSupplier: (data: any) => ipcRenderer.invoke('add-supplier', data),
        getSupplierById: (id: number) => ipcRenderer.invoke('get-supplier-by-id', id),
        createPurchase: (data: any) => ipcRenderer.invoke('create-purchase', data),
        addPayment: (data: any) => ipcRenderer.invoke('add-supplier-payment', data),
        getLedger: (id: number) => ipcRenderer.invoke('get-supplier-ledger', id),
        getAllPayments: () => ipcRenderer.invoke('get-all-supplier-payments'),
    },
    dashboard: {
        getStats: () => ipcRenderer.invoke('get-dashboard-stats'),
    },
    reports: {
        getReportData: () => ipcRenderer.invoke('get-report-data'),
    },
    print: {
        generateHTML: (type: string, data: any) => ipcRenderer.invoke('print:generate-html', { type, data }),
        doPrint: (html: string) => ipcRenderer.invoke('print:do-print', html),
    },
    backup: {
        export: () => ipcRenderer.invoke('backup:export'),
    },
    utils: {
        seed: () => ipcRenderer.invoke('db:seed'),
    }
});
