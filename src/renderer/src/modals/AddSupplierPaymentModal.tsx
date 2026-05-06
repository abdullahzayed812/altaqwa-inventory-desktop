import React, { useState, useEffect } from 'react';

interface AddSupplierPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialSupplierId?: number;
}

export const AddSupplierPaymentModal: React.FC<AddSupplierPaymentModalProps> = ({ isOpen, onClose, onSuccess, initialSupplierId }) => {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [supplierId, setSupplierId] = useState<number | ''>(initialSupplierId || '');
    const [amount, setAmount] = useState<number>(0);
    const [note, setNote] = useState('');
    const [error, setError] = useState('');

    const selectedSupplier = suppliers.find(s => s.id === Number(supplierId));

    useEffect(() => {
        if (isOpen) {
            setError('');
            setAmount(0);
            loadSuppliers();
            if (initialSupplierId) setSupplierId(initialSupplierId);
        }
    }, [isOpen, initialSupplierId]);

    const loadSuppliers = async () => {
        try {
            // @ts-ignore
            const s = await window.api.suppliers.getSuppliers();
            setSuppliers(s);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedSupplier && Number(amount) > Number(selectedSupplier.totalBalance)) {
            setError(`المبلغ لا يمكن أن يتجاوز المستحق للمورد (${Number(selectedSupplier.totalBalance).toLocaleString()} ج.م)`);
            return;
        }

        if (!supplierId || amount <= 0) return;
        
        try {
            // @ts-ignore
            await window.api.suppliers.addPayment({
                supplierId: Number(supplierId),
                amount: Number(amount),
                note
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rtl">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg">تسجيل دفعة مورد</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="px-8 py-8 space-y-6">
                    <div className="space-y-2">
                        <label className="block font-bold">المورد</label>
                        <select 
                            value={supplierId} 
                            onChange={e => {
                                setSupplierId(Number(e.target.value));
                                setError('');
                            }}
                            className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                            required
                        >
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
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={e => {
                                setAmount(Number(e.target.value));
                                setError('');
                            }}
                            className={`w-full h-12 px-4 bg-slate-50 border ${error ? 'border-red-500 focus:ring-red-200' : 'border-slate-300'} rounded-lg outline-none text-right font-bold text-lg text-primary`}
                            placeholder="0.00"
                            required
                        />
                        {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block font-bold">ملاحظات</label>
                        <textarea 
                            value={note} 
                            onChange={e => setNote(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-lg outline-none resize-none"
                            placeholder="أدخل أي ملاحظات إضافية..."
                            rows={3}
                        ></textarea>
                    </div>
                </div>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-slate-200 bg-white">إلغاء</button>
                    <button onClick={handleSubmit} className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/30">تأكيد الدفع</button>
                </div>
            </div>
        </div>
    );
};
