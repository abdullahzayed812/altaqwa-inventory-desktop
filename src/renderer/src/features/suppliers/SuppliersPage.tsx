import React, { useState, useEffect } from 'react';
import { AddSupplierModal } from '../../modals/AddSupplierModal';
import { PrintPreviewModal } from '../../modals/PrintPreviewModal';
import { Link } from 'react-router-dom';

export const SuppliersPage: React.FC = () => {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [printHtml, setPrintHtml] = useState('');

    const loadSuppliers = async () => {
        try {
            // @ts-ignore
            const data = await window.api.suppliers.getSuppliers();
            setSuppliers(data);
        } catch (e) {
            console.error('Failed to load suppliers');
        }
    };

    const handlePrint = async () => {
        try {
            // @ts-ignore
            const html = await window.api.print.generateHTML('suppliers', suppliers);
            setPrintHtml(html);
            setPreviewOpen(true);
        } catch (e) {
            console.error('Failed to generate print HTML');
        }
    };

    const executePrint = async () => {
        try {
            // @ts-ignore
            await window.api.print.doPrint(printHtml);
            setPreviewOpen(false);
        } catch (e) {
            console.error('Failed to print');
        }
    };

    useEffect(() => {
        loadSuppliers();
    }, []);

    const totalBalance = suppliers.reduce((sum, s) => sum + Number(s.totalBalance), 0);

    return (
        <div className="px-8 pb-12 rtl">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h2 className="font-headline-xl text-slate-900 mb-1">إدارة الموردين</h2>
                    <p className="text-slate-500">قائمة بجميع الموردين الذين يوفرون المخزون للمستودع.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handlePrint}
                        className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-primary transition-colors group"
                    >
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
                            <p className="text-xs text-slate-500">إجمالي مستحقات الموردين</p>
                            <p className="text-lg font-bold text-slate-900">{totalBalance.toLocaleString()} <span className="text-xs font-normal text-slate-400">ج.م</span></p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-blue-600">inventory</span>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">عدد الموردين</p>
                            <p className="text-lg font-bold text-slate-900">{suppliers.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-headline-md font-bold text-slate-900">قائمة الموردين</h3>
                    <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition-all">
                        <span className="material-symbols-outlined text-sm">person_add</span>
                        إضافة مورد جديد
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="text-slate-500 border-b border-slate-50 text-sm font-medium">
                                <th className="pb-4 pr-4">#</th>
                                <th className="pb-4">اسم المورد</th>
                                <th className="pb-4">رقم الهاتف</th>
                                <th className="pb-4">العنوان</th>
                                <th className="pb-4 text-left">المستحقات (له)</th>
                                <th className="pb-4 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {suppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-400">لا يوجد موردين حالياً.</td>
                                </tr>
                            ) : suppliers.map(supplier => (
                                <tr key={supplier.id} className="hover:bg-blue-50/30 transition-all group">
                                    <td className="py-4 pr-4 text-slate-500 font-data-tabular">{supplier.id}</td>
                                    <td className="py-4 font-bold text-slate-900">{supplier.name}</td>
                                    <td className="py-4 text-slate-600 font-data-tabular">{supplier.phone}</td>
                                    <td className="py-4 text-slate-600">{supplier.address || '-'}</td>
                                    <td className={`py-4 text-left font-bold font-data-tabular ${Number(supplier.totalBalance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {Number(supplier.totalBalance).toLocaleString()} ج.م
                                    </td>
                                    <td className="py-4 text-center">
                                        <Link to={`/suppliers/${supplier.id}`} className="text-primary hover:underline text-sm font-bold">
                                            التفاصيل وكشف الحساب
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddSupplierModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSuccess={loadSuppliers} />
            
            <PrintPreviewModal 
                isOpen={isPreviewOpen} 
                onClose={() => setPreviewOpen(false)} 
                html={printHtml} 
                onPrint={executePrint}
                title="معاينة قائمة الموردين"
            />
        </div>
    );
};
