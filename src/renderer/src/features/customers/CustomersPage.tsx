import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, deleteCustomer } from '../../api';
import { AddCustomerModal } from '../../modals/AddCustomerModal';
import { PrintPreviewModal } from '../../modals/PrintPreviewModal';

export const CustomersPage: React.FC = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [printHtml, setPrintHtml] = useState('');

    const loadCustomers = async () => {
        try {
            const data = await getCustomers();
            setCustomers(data);
        } catch (e) {
            console.error('Failed to load customers');
        }
    };

    const handlePrint = async () => {
        try {
            const html = await window.api.print.generateHTML('customers', customers);
            setPrintHtml(html);
            setPreviewOpen(true);
        } catch (e) {
            console.error('Failed to generate print HTML');
        }
    };

    const executePrint = async () => {
        try {
            await window.api.print.doPrint(printHtml);
            setPreviewOpen(false);
        } catch (e) {
            console.error('Failed to print');
        }
    };

    const handleDelete = async (customer: any) => {
        if (!window.confirm(`هل أنت متأكد من حذف "${customer.name}"؟`)) return;
        try {
            await deleteCustomer(customer.id);
            loadCustomers();
        } catch (err: any) {
            alert(err.message || 'فشل حذف العميل');
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const totalDebt = customers.reduce((sum, c) => sum + Number(c.totalDebt), 0);

    const filtered = customers.filter(c => {
        const q = search.toLowerCase();
        return !q || c.name.toLowerCase().includes(q) || (c.phone || '').includes(q) || (c.address || '').toLowerCase().includes(q);
    });

    return (
        <div className="px-8 pb-12 rtl">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h2 className="font-headline-xl text-slate-900 mb-1">إدارة العملاء والسائقين</h2>
                    <p className="text-slate-500">قائمة شاملة بجميع العملاء والسائقين وحساباتهم الجارية.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handlePrint} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-primary transition-colors group">
                        <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined text-slate-600 group-hover:text-primary">print</span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 font-bold">طباعة القائمة</p>
                            <p className="text-sm font-bold text-slate-900">تصدير PDF / طباعة</p>
                        </div>
                    </button>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="bg-red-50 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-red-600">account_balance_wallet</span>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">إجمالي المديونيات</p>
                            <p className="text-lg font-bold text-slate-900">{totalDebt.toLocaleString()} <span className="text-xs font-normal text-slate-400">ج.م</span></p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-blue-600">group</span>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">الإجمالي</p>
                            <p className="text-lg font-bold text-slate-900">{customers.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-headline-md font-bold text-slate-900">القائمة</h3>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">search</span>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="بحث بالاسم أو الهاتف أو العنوان..."
                                className="w-64 h-10 pr-10 pl-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            />
                        </div>
                        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition-all">
                            <span className="material-symbols-outlined text-sm">person_add</span>
                            إضافة جديد
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="text-slate-500 border-b border-slate-50 text-sm font-medium">
                                <th className="pb-4 pr-4">رقم</th>
                                <th className="pb-4">الاسم</th>
                                <th className="pb-4">النوع</th>
                                <th className="pb-4">رقم الهاتف</th>
                                <th className="pb-4">العنوان</th>
                                <th className="pb-4">الرصيد</th>
                                <th className="pb-4 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-slate-400">
                                        {search ? `لا توجد نتائج لـ "${search}"` : 'لا يوجد عملاء حالياً. أضف عميلاً جديداً.'}
                                    </td>
                                </tr>
                            ) : filtered.map(customer => (
                                <tr key={customer.id} className="hover:bg-blue-50/30 transition-all group">
                                    <td className="py-4 pr-4 text-slate-500 font-data-tabular">#{customer.id}</td>
                                    <td className="py-4 font-bold text-slate-900">{customer.name}</td>
                                    <td className="py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                            customer.type === 'driver'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {customer.type === 'driver' ? 'سائق' : 'عميل'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-slate-600 font-data-tabular">{customer.phone || '-'}</td>
                                    <td className="py-4 text-slate-600">{customer.address || '-'}</td>
                                    <td className={`py-4 font-bold font-data-tabular ${Number(customer.totalDebt) > 0 ? 'text-red-600' : Number(customer.totalDebt) < 0 ? 'text-blue-600' : 'text-slate-500'}`}>
                                        {Number(customer.totalDebt) < 0
                                            ? `مستحق الدفع: ${Math.abs(Number(customer.totalDebt)).toLocaleString()} ج.م`
                                            : `${Number(customer.totalDebt).toLocaleString()} ج.م`
                                        }
                                    </td>
                                    <td className="py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link to={`/customers/${customer.id}`} className="px-3 py-1 text-primary hover:bg-primary/10 rounded-lg text-sm font-bold transition-all">
                                                التفاصيل
                                            </Link>
                                            <button onClick={() => handleDelete(customer)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="حذف">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddCustomerModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSuccess={loadCustomers} />
            <PrintPreviewModal isOpen={isPreviewOpen} onClose={() => setPreviewOpen(false)} html={printHtml} onPrint={executePrint} title="معاينة القائمة" />
        </div>
    );
};
