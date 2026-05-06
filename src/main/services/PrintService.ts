
import { BrowserWindow, ipcMain } from 'electron';
import { PrintTemplates } from './PrintTemplates';

export class PrintService {
    static init() {
        ipcMain.handle('print:generate-html', async (_, { type, data }) => {
            switch (type) {
                case 'customers':
                    return PrintTemplates.customerList(data);
                case 'suppliers':
                    return PrintTemplates.supplierList(data);
                case 'products':
                    return PrintTemplates.productList(data);
                case 'orders':
                    return PrintTemplates.orderList(data);
                case 'payments':
                    return PrintTemplates.paymentList(data);
                case 'supplier_payments':
                    return PrintTemplates.supplierPaymentList(data);
                case 'invoice':
                    return PrintTemplates.invoice(data);
                case 'report':
                    return PrintTemplates.analyticalReport(data);
                case 'ledger':
                    return PrintTemplates.customerLedger(data.customer, data.transactions);
                default:
                    throw new Error('Unknown print type');
            }
        });

        ipcMain.handle('print:do-print', async (_, html) => {
            const win = new BrowserWindow({
                show: false,
                webPreferences: {
                    nodeIntegration: false,
                }
            });

            await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
            
            return new Promise((resolve, reject) => {
                win.webContents.print({
                    silent: false,
                    printBackground: true,
                    deviceName: '',
                }, (success, failureReason) => {
                    win.close();
                    if (success) resolve(true);
                    else reject(new Error(failureReason));
                });
            });
        });
    }
}
