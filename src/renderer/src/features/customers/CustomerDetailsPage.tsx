import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCustomerById, getCustomerOrders, getCustomerPayments, updateCustomer, deleteCustomer, createPayment, updatePayment } from '../../api';
import { PaymentMethod } from '../../types';

export const CustomerDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'orders' | 'payments'>('orders');

    const [isEditOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editSaving, setEditSaving] = useState(false);

    const [isPaymentOpen, setPaymentOpen] = useState(false);
    const [payAmount, setPayAmount] = useState('');
    const [payMethod, setPayMethod] = useState<'CASH' | 'BANK'>('CASH');
    const [payNotes, setPayNotes] = useState('');
    const [payError, setPayError] = useState('');
    const [paySaving, setPaySaving] = useState(false);

    const [editPayment, setEditPayment] = useState<any>(null);
    const [editPayAmount, setEditPayAmount] = useState('');
    const [editPayMethod, setEditPayMethod] = useState<'CASH' | 'BANK'>('CASH');
    const [editPayNotes, setEditPayNotes] = useState('');
    const [editPayError, setEditPayError] = useState('');
    const [editPaySaving, setEditPaySaving] = useState(false);

    const loadData = async () => {
        if (!id) return;
        try {
            const [c, o, p] = await Promise.all([
                getCustomerById(Number(id)),
                getCustomerOrders(Number(id)),
                getCustomerPayments(Number(id)),
            ]);
            setCustomer(c);
            setOrders(o);
            setPayments(p);
        } catch (e) {
            console.error('Failed to load customer details');
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const openEdit = () => {
        setEditName(customer.name);
        setEditPhone(customer.phone || '');
        setEditAddress(customer.address || '');
        setEditOpen(true);
    };

    const saveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditSaving(true);
        try {
            await updateCustomer(Number(id), {
                name: editName,
                phone: editPhone || null,
                address: editAddress || null,
            });
            setEditOpen(false);
            loadData();
        } catch (err: any) {
            alert(err.message || 'فشل تحديث بيانات العميل');
        } finally {
            setEditSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`هل أنت متأكد من حذف "${customer?.name}"؟`)) return;
        try {
            await deleteCustomer(Number(id));
            navigate('/customers');
        } catch (err: any) {
            alert(err.message || 'فشل حذف العميل');
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setPayError('');
        const amount = Number(payAmount);
        if (amount <= 0) { setPayError('أدخل مبلغاً صحيحاً'); return; }
        setPaySaving(true);
        try {
            await createPayment({
                customerId: Number(id),
                amount,
                method: payMethod as PaymentMethod,
                notes: payNotes || undefined,
            });
            setPaymentOpen(false);
            setPayAmount(''); setPayNotes(''); setPayError('');
            loadData();
        } catch (err: any) {
            setPayError(err.message || 'فشل تسجيل الدفعة');
        } finally {
            setPaySaving(false);
        }
    };

    const openEditPayment = (p: any) => {
        setEditPayment(p);
        setEditPayAmount(String(p.amount));
        setEditPayMethod(p.method === 'BANK' ? 'BANK' : 'CASH');
        setEditPayNotes(p.notes || '');
        setEditPayError('');
    };

    const handleEditPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditPayError('');
        const amount = Number(editPayAmount);
        if (amount <= 0) { setEditPayError('أدخل مبلغاً صحيحاً'); return; }
        setEditPaySaving(true);
        try {
            await updatePayment(editPayment.id, {
                amount,
                method: editPayMethod,
                notes: editPayNotes || null,
            });
            setEditPayment(null);
            loadData();
        } catch (err: any) {
            setEditPayError(err.message || 'فشل تعديل الدفعة');
        } finally {
            setEditPaySaving(false);
        }
    };

    if (!customer) return <div className="p-8 text-center">جاري التحميل...</div>;

    const debt = Number(customer.totalDebt);
    const balanceLabel = debt < 0 ? 'مستحق الدفع' : 'المديونية';
    const balanceColor = debt < 0 ? 'text-blue-600' : 'text-red-600';
    const balanceBg = debt < 0 ? 'bg-blue-50' : 'bg-red-50';

    return (
        <div className="px-8 pb-12 rtl">
            <div className="mb-6">
                <Link to="/customers" className="text-primary flex items-center gap-1 mb-4 hover:underline">
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    العودة للقائمة
                </Link>
                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="font-headline-xl text-slate-900">{customer.name}</h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${customer.type === 'driver' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                {customer.type === 'driver' ? 'سائق' : 'عميل'}
                            </span>
                        </div>
                        <p className="text-slate-500">تفاصيل الحساب الجاري.</p>
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
                        <button onClick={() => setPaymentOpen(true)} className="bg-primary px-6 py-2 rounded-xl shadow-sm text-white flex items-center gap-2 hover:bg-blue-800 transition-all">
                            <span className="material-symbols-outlined text-sm">payments</span>
                            تسجيل دفعة
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">بيانات التواصل</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">phone</span>
                            <div>
                                <p className="text-xs text-slate-500">رقم الهاتف</p>
                                <p className="font-bold text-slate-900 font-data-tabular">{customer.phone || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">location_on</span>
                            <div>
                                <p className="text-xs text-slate-500">العنوان</p>
                                <p className="font-bold text-slate-900">{customer.address || '-'}</p>
                            </div>
                        </div>
                        {customer.type === 'driver' && customer.vehiclePlate && (
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400">local_shipping</span>
                                <div>
                                    <p className="text-xs text-slate-500">رقم اللوحة</p>
                                    <p className="font-bold text-slate-900">{customer.vehiclePlate}</p>
                                    {customer.vehicleDetails && <p className="text-xs text-slate-500">{customer.vehicleDetails}</p>}
                                </div>
                            </div>
                        )}
                        <div className={`p-4 rounded-xl text-center ${balanceBg} mt-4 border-t pt-4`}>
                            <p className="text-xs text-slate-500 mb-1">{balanceLabel}</p>
                            <p className={`text-2xl font-bold font-data-tabular ${balanceColor}`}>
                                {Math.abs(debt).toLocaleString()} ج.م
                            </p>
                        </div>
                    </div>
                </div>

                <div className="col-span-9 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex border-b border-slate-100">
                        <button onClick={() => setActiveTab('orders')}
                            className={`px-6 py-4 font-bold text-sm transition-all ${activeTab === 'orders' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}>
                            الطلبات ({orders.length})
                        </button>
                        <button onClick={() => setActiveTab('payments')}
                            className={`px-6 py-4 font-bold text-sm transition-all ${activeTab === 'payments' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}>
                            المدفوعات ({payments.length})
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        {activeTab === 'orders' ? (
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="text-slate-500 border-b border-slate-50 text-sm bg-slate-50/50">
                                        <th className="px-6 py-3">رقم الطلب</th>
                                        <th className="px-6 py-3">التاريخ</th>
                                        <th className="px-6 py-3">الأصناف</th>
                                        <th className="px-6 py-3">الحالة</th>
                                        <th className="px-6 py-3 text-left">الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {orders.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-8 text-slate-400">لا يوجد طلبات.</td></tr>
                                    ) : orders.map(order => (
                                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-data-tabular font-bold">{order.orderNumber}</td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {order.items?.map((i: any) => `${i.product?.name} (${i.quantity})`).join('، ')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {order.status === 'PENDING' ? 'قيد الانتظار' :
                                                     order.status === 'DELIVERED' ? 'تم التسليم' : 'ملغي'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold font-data-tabular text-left">{Number(order.totalAmount).toLocaleString()} ج.م</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="text-slate-500 border-b border-slate-50 text-sm bg-slate-50/50">
                                        <th className="px-6 py-3">التاريخ</th>
                                        <th className="px-6 py-3">طريقة الدفع</th>
                                        <th className="px-6 py-3">ملاحظات</th>
                                        <th className="px-6 py-3 text-left">المبلغ</th>
                                        <th className="px-6 py-3 text-center">تعديل</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {payments.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-8 text-slate-400">لا يوجد مدفوعات.</td></tr>
                                    ) : payments.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-slate-500 text-sm">{new Date(p.createdAt).toLocaleDateString('ar-EG')}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-slate-100 rounded-full text-xs">
                                                    {p.method === 'CASH' ? 'نقدي' : 'حوالة'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">{p.notes || '-'}</td>
                                            <td className="px-6 py-4 font-bold font-data-tabular text-blue-700 text-left">{Number(p.amount).toLocaleString()} ج.م</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => openEditPayment(p)}
                                                    className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                    title="تعديل الدفعة"
                                                >
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Customer Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rtl">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg">تعديل البيانات</h3>
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

            {/* New Payment Modal */}
            {isPaymentOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rtl">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg">تسجيل دفعة - {customer.name}</h3>
                            <button onClick={() => setPaymentOpen(false)} className="text-slate-400 hover:text-primary">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handlePayment} className="px-6 py-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">المبلغ</label>
                                <input value={payAmount} onChange={e => { setPayAmount(e.target.value); setPayError(''); }} required type="number" min="0.01" step="0.01"
                                    className={`w-full h-11 px-4 bg-slate-50 border ${payError ? 'border-red-400' : 'border-slate-300'} rounded-lg outline-none focus:ring-2 focus:ring-primary font-bold text-lg text-primary`}
                                    placeholder="0.00" />
                                {payError && <p className="text-xs text-red-600 mt-1">{payError}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">طريقة الدفع</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setPayMethod('CASH')}
                                        className={`py-2 rounded-lg border font-bold text-sm transition-all ${payMethod === 'CASH' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                                        نقدي
                                    </button>
                                    <button type="button" onClick={() => setPayMethod('BANK')}
                                        className={`py-2 rounded-lg border font-bold text-sm transition-all ${payMethod === 'BANK' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                                        حوالة بنكية
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">ملاحظات</label>
                                <textarea value={payNotes} onChange={e => setPayNotes(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary resize-none" rows={2} placeholder="اختياري..." />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setPaymentOpen(false)} className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600">إلغاء</button>
                                <button type="submit" disabled={paySaving} className="px-6 py-2 bg-primary text-white rounded-lg font-bold disabled:opacity-50">
                                    {paySaving ? 'جاري الحفظ...' : 'تأكيد الدفعة'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Payment Modal */}
            {editPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rtl">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg">تعديل الدفعة</h3>
                            <button onClick={() => setEditPayment(null)} className="text-slate-400 hover:text-primary">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleEditPayment} className="px-6 py-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">المبلغ</label>
                                <input value={editPayAmount} onChange={e => { setEditPayAmount(e.target.value); setEditPayError(''); }} required type="number" min="0.01" step="0.01"
                                    className={`w-full h-11 px-4 bg-slate-50 border ${editPayError ? 'border-red-400' : 'border-slate-300'} rounded-lg outline-none focus:ring-2 focus:ring-primary font-bold text-lg text-primary`}
                                    placeholder="0.00" />
                                {editPayError && <p className="text-xs text-red-600 mt-1">{editPayError}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">طريقة الدفع</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setEditPayMethod('CASH')}
                                        className={`py-2 rounded-lg border font-bold text-sm transition-all ${editPayMethod === 'CASH' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                                        نقدي
                                    </button>
                                    <button type="button" onClick={() => setEditPayMethod('BANK')}
                                        className={`py-2 rounded-lg border font-bold text-sm transition-all ${editPayMethod === 'BANK' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                                        حوالة بنكية
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">ملاحظات</label>
                                <textarea value={editPayNotes} onChange={e => setEditPayNotes(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary resize-none" rows={2} placeholder="اختياري..." />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditPayment(null)} className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600">إلغاء</button>
                                <button type="submit" disabled={editPaySaving} className="px-6 py-2 bg-primary text-white rounded-lg font-bold disabled:opacity-50">
                                    {editPaySaving ? 'جاري الحفظ...' : 'حفظ التعديل'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
