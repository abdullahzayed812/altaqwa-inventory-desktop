
export class PrintTemplates {
    private static getBaseStyles() {
        return `
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
            
            body {
                direction: rtl;
                font-family: 'Cairo', sans-serif;
                margin: 0;
                padding: 20px;
                background-color: white;
                color: #1e293b;
            }
            .container {
                width: 100%;
                max-width: 210mm; /* A4 Width */
                margin: 0 auto;
            }
            header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .system-name {
                font-size: 24px;
                font-weight: bold;
                color: #1e3a8a;
            }
            .doc-info {
                text-align: left;
                font-size: 14px;
                color: #64748b;
            }
            h1 {
                text-align: center;
                font-size: 20px;
                margin-bottom: 20px;
                background: #f1f5f9;
                padding: 10px;
                border-radius: 8px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #e2e8f0;
                padding: 10px;
                text-align: right;
            }
            th {
                background-color: #f8fafc;
                font-weight: bold;
                color: #334155;
            }
            .total-row {
                font-weight: bold;
                background-color: #f1f5f9;
            }
            .footer {
                margin-top: 50px;
                text-align: center;
                font-size: 12px;
                color: #94a3b8;
                border-top: 1px solid #e2e8f0;
                padding-top: 10px;
            }
            .badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
            }
            .badge-pending { background: #fef3c7; color: #92400e; }
            .badge-success { background: #dcfce7; color: #166534; }
            .badge-danger { background: #fee2e2; color: #991b1b; }
            
            @media print {
                body { padding: 0; }
                .no-print { display: none; }
            }
        `;
    }

    private static wrapTemplate(title: string, content: string) {
        return `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <style>${this.getBaseStyles()}</style>
                <title>${title}</title>
            </head>
            <body>
                <div class="container">
                    <header>
                        <div className="system-name">شركة التقوى للمستلزمات الزراعية</div>
                        <div class="doc-info">
                            <div>التاريخ: ${new Date().toLocaleDateString('ar-EG')}</div>
                            <div>الوقت: ${new Date().toLocaleTimeString('ar-EG')}</div>
                        </div>
                    </header>
                    <h1>${title}</h1>
                    ${content}
                    <div className="footer">
                        تم استخراج هذا التقرير من نظام شركة التقوى للمستلزمات الزراعية &copy; ${new Date().getFullYear()}
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    static customerList(customers: any[]) {
        const rows = customers.map(c => `
            <tr>
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>${c.phone || '-'}</td>
                <td>${c.address || '-'}</td>
                <td style="font-weight: bold; color: ${Number(c.totalDebt) > 0 ? '#dc2626' : '#16a34a'}">
                    ${Number(c.totalDebt).toLocaleString('ar-EG')} ج.م
                </td>
            </tr>
        `).join('');

        const totalDebt = customers.reduce((sum, c) => sum + Number(c.totalDebt), 0);

        const content = `
            <table>
                <thead>
                    <tr>
                        <th>رقم العميل</th>
                        <th>الاسم</th>
                        <th>رقم الهاتف</th>
                        <th>العنوان</th>
                        <th>الرصيد/المديونية</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                    <tr class="total-row">
                        <td colspan="4" style="text-align: left;">الإجمالي:</td>
                        <td>${totalDebt.toLocaleString('ar-EG')} ج.م</td>
                    </tr>
                </tbody>
            </table>
        `;
        return this.wrapTemplate('قائمة العملاء', content);
    }

    static productList(products: any[]) {
        const rows = products.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${Number(p.price).toLocaleString('ar-EG')} ج.م</td>
                <td>${p.stock}</td>
                <td>${(Number(p.price) * Number(p.stock)).toLocaleString('ar-EG')} ج.م</td>
            </tr>
        `).join('');

        const totalValue = products.reduce((sum, p) => sum + (Number(p.price) * Number(p.stock)), 0);

        const content = `
            <table>
                <thead>
                    <tr>
                        <th>رقم الصنف</th>
                        <th>اسم المنتج</th>
                        <th>السعر</th>
                        <th>الكمية المتاحة</th>
                        <th>القيمة الإجمالية</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                    <tr class="total-row">
                        <td colspan="4" style="text-align: left;">إجمالي قيمة المخزون:</td>
                        <td>${totalValue.toLocaleString('ar-EG')} ج.م</td>
                    </tr>
                </tbody>
            </table>
        `;
        return this.wrapTemplate('قائمة المخزون', content);
    }

    static supplierList(suppliers: any[]) {
        const rows = suppliers.map(s => `
            <tr>
                <td>${s.id}</td>
                <td>${s.name}</td>
                <td>${s.phone || '-'}</td>
                <td>${s.address || '-'}</td>
                <td style="font-weight: bold; color: ${Number(s.totalBalance) > 0 ? '#dc2626' : '#16a34a'}">
                    ${Number(s.totalBalance).toLocaleString('ar-EG')} ج.م
                </td>
            </tr>
        `).join('');

        const totalBalance = suppliers.reduce((sum, s) => sum + Number(s.totalBalance), 0);

        const content = `
            <table>
                <thead>
                    <tr>
                        <th>رقم المورد</th>
                        <th>اسم المورد</th>
                        <th>رقم الهاتف</th>
                        <th>العنوان</th>
                        <th>المستحقات (له)</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                    <tr class="total-row">
                        <td colspan="4" style="text-align: left;">إجمالي مستحقات الموردين:</td>
                        <td>${totalBalance.toLocaleString('ar-EG')} ج.م</td>
                    </tr>
                </tbody>
            </table>
        `;
        return this.wrapTemplate('قائمة الموردين', content);
    }

    static supplierPaymentList(payments: any[]) {
        const rows = payments.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.supplier?.name || 'مورد غير معروف'}</td>
                <td>${new Date(p.createdAt).toLocaleDateString('ar-EG')}</td>
                <td>${p.note || '-'}</td>
                <td>${Number(p.amount).toLocaleString('ar-EG')} ج.م</td>
            </tr>
        `).join('');

        const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        const content = `
            <table>
                <thead>
                    <tr>
                        <th>رقم السند</th>
                        <th>المورد</th>
                        <th>التاريخ</th>
                        <th>ملاحظات</th>
                        <th>المبلغ</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                    <tr class="total-row">
                        <td colspan="4" style="text-align: left;">إجمالي المدفوعات للموردين:</td>
                        <td>${total.toLocaleString('ar-EG')} ج.م</td>
                    </tr>
                </tbody>
            </table>
        `;
        return this.wrapTemplate('سجل مدفوعات الموردين', content);
    }

    static orderList(orders: any[]) {
        const rows = orders.map(o => `
            <tr>
                <td>${o.orderNumber}</td>
                <td>${o.customer?.name || 'عميل غير معروف'}</td>
                <td>
                    ${o.items?.map((i: any) => `${i.product?.name} (${i.quantity})`).join('<br>')}
                </td>
                <td>${new Date(o.createdAt).toLocaleDateString('ar-EG')}</td>
                <td>${this.getStatusLabel(o.status)}</td>
                <td>${Number(o.totalAmount).toLocaleString('ar-EG')} ج.م</td>
            </tr>
        `).join('');

        const total = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

        const content = `
            <table>
                <thead>
                    <tr>
                        <th>رقم الطلب</th>
                        <th>العميل</th>
                        <th>الأصناف</th>
                        <th>التاريخ</th>
                        <th>الحالة</th>
                        <th>المبلغ الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                    <tr class="total-row">
                        <td colspan="5" style="text-align: left;">إجمالي الطلبات:</td>
                        <td>${total.toLocaleString('ar-EG')} ج.م</td>
                    </tr>
                </tbody>
            </table>
        `;
        return this.wrapTemplate('سجل الطلبات', content);
    }

    static paymentList(payments: any[]) {
        const rows = payments.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.customer?.name || 'عميل غير معروف'}</td>
                <td>${new Date(p.createdAt).toLocaleDateString('ar-EG')}</td>
                <td>${p.method === 'CASH' ? 'كاش' : 'تحويل بنكي'}</td>
                <td>${Number(p.amount).toLocaleString('ar-EG')} ج.م</td>
            </tr>
        `).join('');

        const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        const content = `
            <table>
                <thead>
                    <tr>
                        <th>رقم السند</th>
                        <th>العميل</th>
                        <th>التاريخ</th>
                        <th>طريقة الدفع</th>
                        <th>المبلغ</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                    <tr class="total-row">
                        <td colspan="4" style="text-align: left;">إجمالي التحصيلات:</td>
                        <td>${total.toLocaleString('ar-EG')} ج.م</td>
                    </tr>
                </tbody>
            </table>
        `;
        return this.wrapTemplate('سجل المدفوعات والتحصيلات', content);
    }

    static invoice(order: any) {
        const itemRows = order.items?.map((i: any) => `
            <tr>
                <td>${i.product?.name}</td>
                <td>${i.quantity}</td>
                <td>${Number(i.price).toLocaleString('ar-EG')} ج.م</td>
                <td>${(Number(i.price) * Number(i.quantity)).toLocaleString('ar-EG')} ج.م</td>
            </tr>
        `).join('');

        const content = `
            <div style="margin-bottom: 30px; display: flex; justify-content: space-between;">
                <div>
                    <strong>العميل:</strong> ${order.customer?.name}<br>
                    <strong>رقم الهاتف:</strong> ${order.customer?.phone || '-'}<br>
                    <strong>العنوان:</strong> ${order.customer?.address || '-'}
                </div>
                <div style="text-align: left;">
                    <strong>رقم الفاتورة:</strong> ${order.orderNumber}<br>
                    <strong>التاريخ:</strong> ${new Date(order.createdAt).toLocaleDateString('ar-EG')}<br>
                    <strong>الحالة:</strong> ${this.getStatusLabel(order.status)}
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>المنتج</th>
                        <th>الكمية</th>
                        <th>سعر الوحدة</th>
                        <th>الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemRows}
                    <tr class="total-row">
                        <td colspan="3" style="text-align: left;">الإجمالي النهائي:</td>
                        <td>${Number(order.totalAmount).toLocaleString('ar-EG')} ج.م</td>
                    </tr>
                </tbody>
            </table>

            <div style="margin-top: 40px; border: 1px dashed #cbd5e1; padding: 20px; border-radius: 8px;">
                <h3 style="margin-top: 0;">شروط عامة:</h3>
                <ul style="margin-bottom: 0;">
                    <li>يرجى مراجعة البضاعة عند الاستلام.</li>
                    <li>لا يمكن استرجاع البضاعة بعد مرور 24 ساعة.</li>
                </ul>
            </div>

            <div style="margin-top: 60px; display: flex; justify-content: space-around;">
                <div style="text-align: center; border-top: 1px solid #000; width: 150px; padding-top: 10px;">توقيع المستلم</div>
                <div style="text-align: center; border-top: 1px solid #000; width: 150px; padding-top: 10px;">ختم المستودع</div>
            </div>
        `;
        return this.wrapTemplate(`فاتورة طلب رقم ${order.orderNumber}`, content);
    }

    static analyticalReport(data: any) {
        const totalSales = data.recentSales.reduce((acc: number, curr: any) => acc + Number(curr.total), 0);
        
        const balanceRows = data.customerBalances.map((c: any) => `
            <tr>
                <td>${c.name}</td>
                <td>${c.phone || '-'}</td>
                <td style="font-weight: bold; color: #dc2626">${Number(c.totalDebt).toLocaleString('ar-EG')} ج.م</td>
            </tr>
        `).join('');

        const content = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                <div style="background: #eff6ff; padding: 20px; border-radius: 12px; border: 1px solid #bfdbfe;">
                    <div style="font-size: 14px; color: #1e40af; margin-bottom: 5px;">إجمالي المبيعات (الفترة الأخيرة)</div>
                    <div style="font-size: 24px; font-weight: bold; color: #1e3a8a;">${totalSales.toLocaleString('ar-EG')} ج.م</div>
                </div>
                <div style="background: #fff1f2; padding: 20px; border-radius: 12px; border: 1px solid #fecaca;">
                    <div style="font-size: 14px; color: #991b1b; margin-bottom: 5px;">إجمالي المديونيات المستحقة</div>
                    <div style="font-size: 24px; font-weight: bold; color: #991b1b;">${data.customerBalances.reduce((a: any, b: any) => a + Number(b.totalDebt), 0).toLocaleString('ar-EG')} ج.م</div>
                </div>
            </div>

            <h2 style="font-size: 18px; border-right: 4px solid #3b82f6; padding-right: 10px; margin-bottom: 15px;">أرصدة العملاء المدينة</h2>
            <table>
                <thead>
                    <tr>
                        <th>العميل</th>
                        <th>رقم الهاتف</th>
                        <th>الرصيد المستحق</th>
                    </tr>
                </thead>
                <tbody>
                    ${balanceRows}
                </tbody>
            </table>
        `;
        return this.wrapTemplate('التقرير التحليلي للمستودع', content);
    }

    static customerLedger(customer: any, transactions: any[]) {
        const rows = transactions.map(t => `
            <tr>
                <td>${new Date(t.date).toLocaleDateString('ar-EG')}</td>
                <td>${t.description}</td>
                <td>${t.type === 'DEBIT' ? Number(t.amount).toLocaleString('ar-EG') + ' ج.م' : '-'}</td>
                <td>${t.type === 'CREDIT' ? Number(t.amount).toLocaleString('ar-EG') + ' ج.م' : '-'}</td>
                <td style="font-weight: bold;">${Number(t.balance).toLocaleString('ar-EG')} ج.م</td>
            </tr>
        `).join('');

        const content = `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc;">
                <strong>العميل:</strong> ${customer.name}<br>
                <strong>رقم الهاتف:</strong> ${customer.phone || '-'}<br>
                <strong>الرصيد الحالي:</strong> ${Number(customer.totalDebt).toLocaleString('ar-EG')} ج.م
            </div>

            <table>
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>البيان</th>
                        <th>مدين (طلب)</th>
                        <th>دائن (دفعة)</th>
                        <th>الرصيد الجاري</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
        return this.wrapTemplate(`كشف حساب العميل: ${customer.name}`, content);
    }

    private static getStatusLabel(status: string) {
        switch (status) {
            case 'PENDING': return 'قيد الانتظار';
            case 'ASSIGNED': return 'قيد التوصيل';
            case 'DELIVERED': return 'تم التسليم';
            case 'CANCELLED': return 'ملغي';
            default: return status;
        }
    }
}
