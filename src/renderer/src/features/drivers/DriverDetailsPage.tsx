import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getDriverById, getDriverLedger, updateDriver, deleteDriver, addDriverPayment, addDriverDebt, updateDriverAvailability } from '../../api';

export const DriverDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [driver, setDriver] = useState<any>(null);
    const [ledger, setLedger] = useState<any[]>([]);

    const [isEditOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editPlate, setEditPlate] = useState('');
    const [editVehicle, setEditVehicle] = useState('');
    const [editSaving, setEditSaving] = useState(false);

    const [txModal, setTxModal] = useState<'payment' | 'debt' | null>(null);
    const [txAmount, setTxAmount] = useState('');
    const [txNotes, setTxNotes] = useState('');
    const [txError, setTxError] = useState('');
    const [txSaving, setTxSaving] = useState(false);

    const loadData = async () => {
        if (!id) return;
        try {
            const [d, l] = await Promise.all([
                getDriverById(Number(id)),
                getDriverLedger(Number(id)),
            ]);
            setDriver(d);
            setLedger(l);
        } catch (e) {
            console.error('Failed to load driver details');
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const openEdit = () => {
        setEditName(driver.name);
        setEditPhone(driver.phone || '');
        setEditPlate(driver.vehiclePlate || '');
        setEditVehicle(driver.vehicleDetails || '');
        setEditOpen(true);
    };

    const saveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditSaving(true);
        try {
            await updateDriver(Number(id), {
                name: editName,
                phone: editPhone || null,
                vehiclePlate: editPlate || null,
                vehicleDetails: editVehicle || null,
            });
            setEditOpen(false);
            loadData();
        } catch (err: any) {
            alert(err.message || 'فشل تحديث بيانات السائق');
        } finally {
            setEditSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`هل أنت متأكد من حذف السائق "${driver?.name}"؟`)) return;
        try {
            await deleteDriver(Number(id));
            navigate('/drivers');
        } catch (err: any) {
            alert(err.message || 'فشل حذف السائق');
        }
    };

    const handleToggleAvailability = async () => {
        try {
            await updateDriverAvailability(Number(id), !driver.isAvailable);
            loadData();
        } catch (err: any) {
            alert(err.message || 'فشل تحديث حالة السائق');
        }
    };

    const handleTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        setTxError('');
        const amount = Number(txAmount);
        if (!amount || amount <= 0) { setTxError('أدخل مبلغاً صحيحاً'); return; }
        setTxSaving(true);
        try {
            if (txModal === 'payment') {
                await addDriverPayment(Number(id), { amount, notes: txNotes || undefined });
            } else {
                await addDriverDebt(Number(id), { amount, notes: txNotes || undefined });
            }
            setTxModal(null);
            setTxAmount(''); setTxNotes(''); setTxError('');
            loadData();
        } catch (err: any) {
            setTxError(err.message || 'فشل تسجيل العملية');
        } finally {
            setTxSaving(false);
        }
    };

    if (!driver) return <div className="p-8 text-center">جاري التحميل...</div>;

    const balance = Number(driver.totalBalance);
    const balanceLabel = balance < 0 ? 'المديونية' : 'مستحق الدفع';
    const balanceColor = balance < 0 ? 'text-red-600' : 'text-blue-600';
    const balanceBg = balance < 0 ? 'bg-red-50' : 'bg-blue-50';

    return (
        <div className="px-8 pb-12 rtl">
            <div className="mb-6">
                <Link to="/drivers" className="text-primary flex items-center gap-1 mb-4 hover:underline">
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    العودة لقائمة السائقين
                </Link>
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="font-headline-xl text-slate-900 mb-1">{driver.name}</h2>
                        <p className="text-slate-500">تفاصيل السائق وسجل العمليات المالية.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={openEdit} className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 hover:border-blue-500 text-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-sm">edit</span>
                            تعديل
                        </button>
                        <button onClick={handleDelete} className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 hover:border-red-500 text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-sm">delete</span>
                            حذف
                        </button>
                        <button onClick={() => setTxModal('payment')} className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 hover:border-green-500 text-green-600 transition-colors">
                            <span className="material-symbols-outlined text-sm">payments</span>
                            صرف دفعة
                        </button>
                        <button onClick={() => setTxModal('debt')} className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 hover:border-red-500 text-red-600 transition-colors">
                            <span className="material-symbols-outlined text-sm">money_off</span>
                            تسجيل دين
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 mb-8">
                <div className="col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">بيانات السائق</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">phone</span>
                            <div>
                                <p className="text-xs text-slate-500">رقم الهاتف</p>
                                <p className="font-bold text-slate-900 font-data-tabular">{driver.phone || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">confirmation_number</span>
                            <div>
                                <p className="text-xs text-slate-500">لوحة المركبة</p>
                                <p className="font-bold text-slate-900">{driver.vehiclePlate || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">local_shipping</span>
                            <div>
                                <p className="text-xs text-slate-500">بيانات المركبة</p>
                                <p className="font-bold text-slate-900">{driver.vehicleDetails || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">circle</span>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${driver.isAvailable ? 'bg-green-500' : 'bg-red-400'}`}></span>
                                <p className="font-bold text-slate-900 text-sm">{driver.isAvailable ? 'متاح' : 'غير متاح'}</p>
                                <button onClick={handleToggleAvailability} className="text-xs text-primary hover:underline mr-2">تغيير</button>
                            </div>
                        </div>
                        <div className={`p-4 rounded-xl text-center ${balanceBg} border-t pt-4`}>
                            <p className="text-xs text-slate-500 mb-1">{balanceLabel}</p>
                            <p className={`text-2xl font-bold font-data-tabular ${balanceColor}`}>
                                {Math.abs(balance).toLocaleString()} ج.م
                            </p>
                        </div>
                    </div>
                </div>

                <div className="col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center justify-between">
                        <span>كشف حساب السائق</span>
                        <span className="text-sm font-normal text-slate-500">آخر العمليات المسجلة</span>
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="text-slate-500 border-b border-slate-50 text-sm">
                                    <th className="pb-4">التاريخ</th>
                                    <th className="pb-4">النوع</th>
                                    <th className="pb-4">ملاحظات</th>
                                    <th className="pb-4 text-left">القيمة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {ledger.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-slate-400">لا يوجد عمليات مسجلة لهذا السائق.</td>
                                    </tr>
                                ) : ledger.map(entry => (
                                    <tr key={entry.id} className="hover:bg-slate-50 transition-all">
                                        <td className="py-4 text-slate-600 text-sm font-data-tabular">
                                            {new Date(entry.createdAt).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="py-4 font-bold">
                                            {entry.type === 'DELIVERY' && (
                                                <span className="flex items-center gap-2 text-blue-700">
                                                    <span className="material-symbols-outlined text-sm">local_shipping</span>
                                                    توصيل
                                                </span>
                                            )}
                                            {entry.type === 'PAYMENT' && (
                                                <span className="flex items-center gap-2 text-green-700">
                                                    <span className="material-symbols-outlined text-sm">payments</span>
                                                    دفعة صرف
                                                </span>
                                            )}
                                            {entry.type === 'DEBT' && (
                                                <span className="flex items-center gap-2 text-red-700">
                                                    <span className="material-symbols-outlined text-sm">money_off</span>
                                                    دين
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 text-slate-500 text-sm">{entry.notes || '-'}</td>
                                        <td className={`py-4 text-left font-bold font-data-tabular ${
                                            entry.type === 'DELIVERY' ? 'text-blue-700' :
                                            entry.type === 'PAYMENT' ? 'text-red-600' :
                                            'text-red-600'
                                        }`}>
                                            {Number(entry.amount).toLocaleString()} ج.م
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rtl">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg">تعديل بيانات السائق</h3>
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
                                <label className="block text-sm font-bold mb-1">لوحة المركبة</label>
                                <input value={editPlate} onChange={e => setEditPlate(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">بيانات المركبة</label>
                                <input value={editVehicle} onChange={e => setEditVehicle(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary" />
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

            {txModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rtl">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg">{txModal === 'payment' ? 'صرف دفعة للسائق' : 'تسجيل دين على السائق'}</h3>
                            <button onClick={() => setTxModal(null)} className="text-slate-400 hover:text-primary">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleTransaction} className="px-6 py-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">المبلغ</label>
                                <input value={txAmount} onChange={e => { setTxAmount(e.target.value); setTxError(''); }} required type="number" min="0.01" step="0.01"
                                    className={`w-full h-11 px-4 bg-slate-50 border ${txError ? 'border-red-400' : 'border-slate-300'} rounded-lg outline-none focus:ring-2 focus:ring-primary font-bold text-lg text-primary`}
                                    placeholder="0.00" />
                                {txError && <p className="text-xs text-red-600 mt-1">{txError}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">ملاحظات</label>
                                <textarea value={txNotes} onChange={e => setTxNotes(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary resize-none" rows={2} placeholder="اختياري..." />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setTxModal(null)} className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600">إلغاء</button>
                                <button type="submit" disabled={txSaving} className={`px-6 py-2 text-white rounded-lg font-bold disabled:opacity-50 ${txModal === 'payment' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                    {txSaving ? 'جاري الحفظ...' : 'تأكيد'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
