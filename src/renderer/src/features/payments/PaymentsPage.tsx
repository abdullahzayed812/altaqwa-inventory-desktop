import React, { useEffect, useState } from 'react';
import { getPayments, getAllSupplierPayments } from '../../api';
import { AddPaymentModal } from '../../modals/AddPaymentModal';
import { AddSupplierPaymentModal } from '../../modals/AddSupplierPaymentModal';
import { PrintPreviewModal } from '../../modals/PrintPreviewModal';

export const PaymentsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
    const [customerPayments, setCustomerPayments] = useState<any[]>([]);
    const [supplierPayments, setSupplierPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [printHtml, setPrintHtml] = useState('');

    const [searchName, setSearchName] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const [cData, sData] = await Promise.all([getPayments(), getAllSupplierPayments()]);
            setCustomerPayments(cData);
            setSupplierPayments(sData);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = async () => {
        try {
            const data = activeTab === 'customers' ? filteredCustomerPayments : filteredSupplierPayments;
            const html = await window.api.print.generateHTML(activeTab === 'customers' ? 'payments' : 'supplier_payments', data);
            setPrintHtml(html);
            setPreviewOpen(true);
        } catch (e) {
            console.error('Failed to generate payments print', e);
        }
    };

    const executePrint = async () => {
        try {
            await window.api.print.doPrint(printHtml);
            setPreviewOpen(false);
        } catch (e) {
            console.error('Failed to print', e);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const filteredCustomerPayments = customerPayments.filter(p => {
        const matchesName = p.customer?.name?.toLowerCase().includes(searchName.toLowerCase());
        const date = new Date(p.createdAt).toISOString().split('T')[0];
        const matchesFrom = fromDate ? date >= fromDate : true;
        const matchesTo = toDate ? date <= toDate : true;
        return matchesName && matchesFrom && matchesTo;
    });

    const filteredSupplierPayments = supplierPayments.filter(p => {
        const matchesName = p.supplier?.name?.toLowerCase().includes(searchName.toLowerCase());
        const date = new Date(p.createdAt).toISOString().split('T')[0];
        const matchesFrom = fromDate ? date >= fromDate : true;
        const matchesTo = toDate ? date <= toDate : true;
        return matchesName && matchesFrom && matchesTo;
    });

    const currentPayments = activeTab === 'customers' ? filteredCustomerPayments : filteredSupplierPayments;

    if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="p-8 rtl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="font-headline-xl text-on-surface">إدارة المدفوعات</h2>
                    <p className="font-body-md text-on-surface-variant mt-1">تتبع التدفقات النقدية الصادرة والواردة.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-white text-slate-700 px-6 py-3 rounded-xl font-label-md border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                        <span className="material-symbols-outlined text-sm">print</span>
                        <span>طباعة السجل</span>
                    </button>
                    {activeTab === 'customers' ? (
                        <button onClick={() => setIsCustomerModalOpen(true)} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-label-md hover:opacity-90 transition-all shadow-lg">
                            <span className="material-symbols-outlined">add</span>
                            <span>إضافة دفعة عميل</span>
                        </button>
                    ) : (
                        <button onClick={() => setIsSupplierModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-label-md hover:bg-emerald-700 transition-all shadow-lg">
                            <span className="material-symbols-outlined">payments</span>
                            <span>تسجيل دفعة مورد</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex gap-4 mb-6 border-b border-slate-200">
                <button onClick={() => setActiveTab('customers')}
                    className={`pb-3 px-4 font-bold transition-all ${activeTab === 'customers' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}>
                    مدفوعات العملاء (وارد)
                </button>
                <button onClick={() => setActiveTab('suppliers')}
                    className={`pb-3 px-4 font-bold transition-all ${activeTab === 'suppliers' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>
                    مدفوعات الموردين (صادر)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative">
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input type="text" placeholder={activeTab === 'customers' ? 'بحث باسم العميل...' : 'بحث باسم المورد...'}
                        value={searchName} onChange={e => setSearchName(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 whitespace-nowrap">من:</span>
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                        className="w-full pr-4 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 whitespace-nowrap">إلى:</span>
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                        className="w-full pr-4 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 font-label-sm text-secondary uppercase tracking-wider">{activeTab === 'customers' ? 'العميل' : 'المورد'}</th>
                                <th className="px-6 py-4 font-label-sm text-secondary uppercase tracking-wider">المبلغ - ج.م</th>
                                <th className="px-6 py-4 font-label-sm text-secondary uppercase tracking-wider">{activeTab === 'customers' ? 'طريقة الدفع' : 'ملاحظات'}</th>
                                <th className="px-6 py-4 font-label-sm text-secondary uppercase tracking-wider">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {currentPayments.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${activeTab === 'customers' ? 'bg-blue-50 text-primary' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {activeTab === 'customers' ? (p.customer?.name?.[0] || '؟') : (p.supplier?.name?.[0] || '؟')}
                                            </div>
                                            <p className="font-bold text-slate-900">{activeTab === 'customers' ? p.customer?.name : p.supplier?.name}</p>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 font-bold font-data-tabular ${activeTab === 'customers' ? 'text-blue-700' : 'text-emerald-700'}`}>
                                        {Number(p.amount).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {activeTab === 'customers' ? (
                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs">
                                                {p.method === 'CASH' ? 'نقدي' : 'حوالة'}
                                            </span>
                                        ) : (
                                            <span className="text-slate-500 text-sm">{p.note || '-'}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-data-tabular text-slate-500">{new Date(p.createdAt).toLocaleDateString('ar-EG')}</td>
                                </tr>
                            ))}
                            {currentPayments.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">لا توجد سجلات.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddPaymentModal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} onSuccess={fetchPayments} />
            <AddSupplierPaymentModal isOpen={isSupplierModalOpen} onClose={() => setIsSupplierModalOpen(false)} onSuccess={fetchPayments} />
            <PrintPreviewModal isOpen={isPreviewOpen} onClose={() => setPreviewOpen(false)} html={printHtml} onPrint={executePrint} title="معاينة سجل المدفوعات" />
        </div>
    );
};
