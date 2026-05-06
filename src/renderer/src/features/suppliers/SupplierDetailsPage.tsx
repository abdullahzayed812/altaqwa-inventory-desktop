import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CreatePurchaseModal } from '../../modals/CreatePurchaseModal';
import { AddSupplierPaymentModal } from '../../modals/AddSupplierPaymentModal';

export const SupplierDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [supplier, setSupplier] = useState<any>(null);
    const [ledger, setLedger] = useState<any[]>([]);
    const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

    const loadData = async () => {
        if (!id) return;
        try {
            // @ts-ignore
            const s = await window.api.suppliers.getSupplierById(Number(id));
            // @ts-ignore
            const l = await window.api.suppliers.getLedger(Number(id));
            setSupplier(s);
            setLedger(l);
        } catch (e) {
            console.error('Failed to load supplier details');
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    if (!supplier) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="px-8 pb-12 rtl">
            <div className="mb-6">
                <Link to="/suppliers" className="text-primary flex items-center gap-1 mb-4 hover:underline">
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    العودة لقائمة الموردين
                </Link>
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="font-headline-xl text-slate-900 mb-1">{supplier.name}</h2>
                        <p className="text-slate-500">تفاصيل المورد وكشف الحساب الجاري.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setPaymentModalOpen(true)}
                            className="bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 hover:border-green-500 transition-colors group"
                        >
                            <div className="bg-green-50 p-2 rounded-lg group-hover:bg-green-100 transition-colors">
                                <span className="material-symbols-outlined text-green-600">payments</span>
                            </div>
                            <span className="font-bold text-slate-900">تسجيل دفعة</span>
                        </button>
                        <button 
                            onClick={() => setPurchaseModalOpen(true)}
                            className="bg-primary px-6 py-3 rounded-xl shadow-sm text-white flex items-center gap-3 hover:bg-blue-800 transition-all"
                        >
                            <span className="material-symbols-outlined">add_shopping_cart</span>
                            <span className="font-bold">إنشاء فاتورة شراء</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 mb-8">
                <div className="col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">بيانات التواصل</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">phone</span>
                            <div>
                                <p className="text-xs text-slate-500">رقم الهاتف</p>
                                <p className="font-bold text-slate-900 font-data-tabular">{supplier.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">location_on</span>
                            <div>
                                <p className="text-xs text-slate-500">العنوان</p>
                                <p className="font-bold text-slate-900">{supplier.address || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pt-4 border-t">
                            <div className={`p-3 rounded-xl w-full text-center ${Number(supplier.totalBalance) > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                                <p className="text-xs text-slate-500 mb-1">الرصيد الحالي (المستحقات)</p>
                                <p className={`text-2xl font-bold font-data-tabular ${Number(supplier.totalBalance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {Number(supplier.totalBalance).toLocaleString()} ج.م
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center justify-between">
                        <span>كشف الحساب (العمليات)</span>
                        <span className="text-sm font-normal text-slate-500">آخر العمليات المسجلة</span>
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="text-slate-500 border-b border-slate-50 text-sm">
                                    <th className="pb-4">التاريخ</th>
                                    <th className="pb-4">البيان (النوع)</th>
                                    <th className="pb-4">رقم المرجع</th>
                                    <th className="pb-4 text-left">القيمة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {ledger.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-slate-400">لا يوجد عمليات مسجلة لهذا المورد.</td>
                                    </tr>
                                ) : ledger.map(entry => (
                                    <tr key={entry.id} className="hover:bg-slate-50 transition-all">
                                        <td className="py-4 text-slate-600 text-sm font-data-tabular">
                                            {new Date(entry.createdAt).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="py-4 font-bold">
                                            {entry.type === 'PURCHASE' ? (
                                                <span className="flex items-center gap-2 text-blue-700">
                                                    <span className="material-symbols-outlined text-sm">shopping_cart</span>
                                                    فاتورة شراء
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 text-green-700">
                                                    <span className="material-symbols-outlined text-sm">payments</span>
                                                    دفعة نقدية
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 text-slate-500 font-data-tabular">#{entry.referenceId}</td>
                                        <td className={`py-4 text-left font-bold font-data-tabular ${entry.type === 'PURCHASE' ? 'text-red-600' : 'text-green-600'}`}>
                                            {entry.type === 'PURCHASE' ? '+' : '-'} {Number(entry.amount).toLocaleString()} ج.م
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CreatePurchaseModal 
                isOpen={isPurchaseModalOpen} 
                onClose={() => setPurchaseModalOpen(false)} 
                onSuccess={loadData} 
                initialSupplierId={Number(id)}
            />
            <AddSupplierPaymentModal 
                isOpen={isPaymentModalOpen} 
                onClose={() => setPaymentModalOpen(false)} 
                onSuccess={loadData} 
                initialSupplierId={Number(id)}
            />
        </div>
    );
};
