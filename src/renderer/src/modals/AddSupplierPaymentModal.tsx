import React, { useState, useEffect } from 'react';
import { getSuppliers, addSupplierPayment } from '../api';
import { PaymentMethod } from '../types';

interface AddSupplierPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialSupplierId?: number;
}

export const AddSupplierPaymentModal: React.FC<AddSupplierPaymentModalProps> = ({ isOpen, onClose, onSuccess, initialSupplierId }) => {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [supplierId, setSupplierId] = useState<number | ''>(initialSupplierId || '');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setError(''); setAmount(''); setNote('');
            if (initialSupplierId) setSupplierId(initialSupplierId);
            getSuppliers().then(setSuppliers).catch(console.error);
        }
    }, [isOpen, initialSupplierId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplierId || !amount || Number(amount) <= 0) return;

        setLoading(true);
        setError('');
        try {
            await addSupplierPayment(Number(supplierId), {
                amount: Number(amount),
                method: PaymentMethod.CASH,
                note: note || undefined,
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rtl">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg">تسجيل دفعة مورد</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-8 py-8 space-y-6">
                        <div className="space-y-2">
                            <label className="block font-bold">المورد</label>
                            <select value={supplierId} onChange={e => setSupplierId(Number(e.target.value))}
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg outline-none" required>
                                <option value="">اختر المورد</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} (المستحق له: {Number(s.totalBalance).toLocaleString()} ج.م)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block font-bold">المبلغ المدفوع</label>
                            <input type="number" value={amount} onChange={e => { setAmount(e.target.value); setError(''); }}
                                className={`w-full h-12 px-4 bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-300'} rounded-lg outline-none text-right font-bold text-lg text-primary`}
                                placeholder="0.00" required min="0.01" step="0.01" />
                            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block font-bold">ملاحظات</label>
                            <textarea value={note} onChange={e => setNote(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-300 rounded-lg outline-none resize-none"
                                placeholder="أدخل أي ملاحظات إضافية..." rows={3}></textarea>
                        </div>
                    </div>

                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                        <button type="button" onClick={onClose} disabled={loading} className="px-6 py-2.5 rounded-lg border border-slate-200 bg-white">إلغاء</button>
                        <button type="submit" disabled={loading} className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/30 disabled:opacity-50">
                            {loading ? 'جاري الحفظ...' : 'تأكيد الدفع'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
