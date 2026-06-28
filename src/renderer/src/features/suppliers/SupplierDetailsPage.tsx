import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSupplierById, getSupplierLedger, updateSupplier, deleteSupplier, getSupplierPaymentById, updateSupplierPayment } from '../../api';
import { CreatePurchaseModal } from '../../modals/CreatePurchaseModal';
import { AddSupplierPaymentModal } from '../../modals/AddSupplierPaymentModal';
import { EditPurchaseModal } from '../../modals/EditPurchaseModal';

export const SupplierDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [supplier, setSupplier] = useState<any>(null);
    const [ledger, setLedger] = useState<any[]>([]);
    const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isEditOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editSaving, setEditSaving] = useState(false);

    const [editPurchaseId, setEditPurchaseId] = useState<number | null>(null);

    const [editPayVisible, setEditPayVisible] = useState(false);
    const [editingPayment, setEditingPayment] = useState<any>(null);
    const [editPayAmount, setEditPayAmount] = useState('');
    const [editPayMethod, setEditPayMethod] = useState<'CASH' | 'BANK'>('CASH');
    const [editPayNote, setEditPayNote] = useState('');
    const [editPaySaving, setEditPaySaving] = useState(false);

    const loadData = async () => {
        if (!id) return;
        try {
            const [s, l] = await Promise.all([
                getSupplierById(Number(id)),
                getSupplierLedger(Number(id)),
            ]);
            setSupplier(s);
            setLedger(l);
        } catch (e) {
            console.error('Failed to load supplier details');
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const openEdit = () => {
        setEditName(supplier.name);
        setEditPhone(supplier.phone || '');
        setEditAddress(supplier.address || '');
        setEditOpen(true);
    };

    const saveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditSaving(true);
        try {
            await updateSupplier(Number(id), {
                name: editName,
                phone: editPhone || null,
                address: editAddress || null,
            });
            setEditOpen(false);
            loadData();
        } catch (err: any) {
            alert(err.message || 'فشل تحديث بيانات المورد');
        } finally {
            setEditSaving(false);
        }
    };

    const openEditPayment = async (referenceId: number) => {
        try {
            const p = await getSupplierPaymentById(referenceId);
            setEditingPayment(p);
            setEditPayAmount(String(p.amount));
            setEditPayMethod(p.method === 'BANK' ? 'BANK' : 'CASH');
            setEditPayNote(p.note ?? '');
            setEditPayVisible(true);
        } catch {
            alert('فشل تحميل بيانات الدفعة');
        }
    };

    const saveEditPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPayment) return;
        const amount = parseFloat(editPayAmount);
        if (!amount || amount <= 0) { alert('أدخل مبلغاً صحيحاً'); return; }
        setEditPaySaving(true);
        try {
            await updateSupplierPayment(editingPayment.id, { amount, method: editPayMethod, note: editPayNote.trim() || null });
            setEditPayVisible(false);
            setEditingPayment(null);
            loadData();
        } catch (err: any) {
            alert(err.message || 'فشل تحديث الدفعة');
        } finally {
            setEditPaySaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`هل أنت متأكد من حذف المورد "${supplier?.name}"؟`)) return;
        try {
            await deleteSupplier(Number(id));
            navigate('/suppliers');
        } catch (err: any) {
            alert(err.message || 'فشل حذف المورد');
        }
    };

    if (!supplier) return <div className="p-8 text-center">جاري التحميل...</div>;

    const balance = Number(supplier.totalBalance);
    const balanceLabel = balance < 0 ? 'المديونية' : 'مستحق الدفع';
    const balanceColor = balance < 0 ? 'text-red-600' : 'text-blue-600';
    const balanceBg = balance < 0 ? 'bg-red-50' : 'bg-blue-50';

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
                        <button onClick={openEdit} className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 hover:border-blue-500 transition-colors text-slate-700">
                            <span className="material-symbols-outlined text-sm">edit</span>
                            تعديل
                        </button>
                        <button onClick={handleDelete} className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 hover:border-red-500 text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-sm">delete</span>
                            حذف
                        </button>
                        <button onClick={() => setPaymentModalOpen(true)} className="bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 hover:border-green-500 transition-colors group">
                            <div className="bg-green-50 p-2 rounded-lg group-hover:bg-green-100 transition-colors">
                                <span className="material-symbols-outlined text-green-600">payments</span>
                            </div>
                            <span className="font-bold text-slate-900">تسجيل دفعة</span>
                        </button>
                        <button onClick={() => setPurchaseModalOpen(true)} className="bg-primary px-6 py-3 rounded-xl shadow-sm text-white flex items-center gap-3 hover:bg-blue-800 transition-all">
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
                                <p className="font-bold text-slate-900 font-data-tabular">{supplier.phone || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">location_on</span>
                            <div>
                                <p className="text-xs text-slate-500">العنوان</p>
                                <p className="font-bold text-slate-900">{supplier.address || '-'}</p>
                            </div>
                        </div>
                        <div className={`p-4 rounded-xl w-full text-center ${balanceBg} mt-4 border-t pt-4`}>
                            <p className="text-xs text-slate-500 mb-1">{balanceLabel}</p>
                            <p className={`text-2xl font-bold font-data-tabular ${balanceColor}`}>
                                {Math.abs(balance).toLocaleString()} ج.م
                            </p>
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
                                    <th className="pb-4 text-left"></th>
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
                                        <td className="py-4 text-left">
                                            {entry.type === 'PURCHASE' ? (
                                                <button
                                                    onClick={() => setEditPurchaseId(entry.referenceId)}
                                                    className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs font-bold"
                                                    title="تعديل الفاتورة"
                                                >
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => entry.referenceId && openEditPayment(entry.referenceId)}
                                                    className="text-green-600 hover:text-green-800 flex items-center gap-1 text-xs font-bold"
                                                    title="تعديل الدفعة"
                                                >
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CreatePurchaseModal isOpen={isPurchaseModalOpen} onClose={() => setPurchaseModalOpen(false)} onSuccess={loadData} initialSupplierId={Number(id)} />
            <AddSupplierPaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} onSuccess={loadData} initialSupplierId={Number(id)} />
            <EditPurchaseModal isOpen={editPurchaseId !== null} purchaseId={editPurchaseId} onClose={() => setEditPurchaseId(null)} onSuccess={loadData} />

            {editPayVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rtl">
                    <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg">تعديل الدفعة</h3>
                            <button onClick={() => { setEditPayVisible(false); setEditingPayment(null); }} className="text-slate-400 hover:text-primary">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={saveEditPayment} className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">المبلغ</label>
                                <input type="number" value={editPayAmount} onChange={e => setEditPayAmount(e.target.value)} required min="0.01" step="0.01"
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">طريقة الدفع</label>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setEditPayMethod('CASH')}
                                        className={`flex-1 py-2 rounded-lg border-2 font-bold text-sm transition-all ${editPayMethod === 'CASH' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200'}`}>
                                        نقدي
                                    </button>
                                    <button type="button" onClick={() => setEditPayMethod('BANK')}
                                        className={`flex-1 py-2 rounded-lg border-2 font-bold text-sm transition-all ${editPayMethod === 'BANK' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200'}`}>
                                        حوالة
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">ملاحظات</label>
                                <textarea value={editPayNote} onChange={e => setEditPayNote(e.target.value)} rows={2}
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary resize-none" />
                            </div>
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => { setEditPayVisible(false); setEditingPayment(null); }}
                                    className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600">إلغاء</button>
                                <button type="submit" disabled={editPaySaving}
                                    className="px-6 py-2 bg-primary text-white rounded-lg font-bold disabled:opacity-50">
                                    {editPaySaving ? 'جاري الحفظ...' : 'حفظ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rtl">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg">تعديل بيانات المورد</h3>
                            <button onClick={() => setEditOpen(false)} className="text-slate-400 hover:text-primary">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={saveEdit} className="px-6 py-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">الاسم</label>
                                <input value={editName} onChange={e => setEditName(e.target.value)} required className="w-full h-11 px-4 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">رقم الهاتف</label>
                                <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary" dir="ltr" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">العنوان</label>
                                <textarea value={editAddress} onChange={e => setEditAddress(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary resize-none" rows={2} />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditOpen(false)} className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600">إلغاء</button>
                                <button type="submit" disabled={editSaving} className="px-6 py-2 bg-primary text-white rounded-lg font-bold disabled:opacity-50">
                                    {editSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
