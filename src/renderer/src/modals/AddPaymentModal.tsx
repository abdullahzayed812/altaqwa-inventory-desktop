import React, { useState, useEffect } from 'react';

interface AddPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [customerId, setCustomerId] = useState('');
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('CASH');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const selectedCustomer = customers.find(c => c.id === Number(customerId));

    useEffect(() => {
        if (isOpen) {
            setError('');
            setAmount('');
            setCustomerId('');
            const fetchCustomers = async () => {
                try {
                    const data = await (window as any).api.customers.getCustomers();
                    setCustomers(data);
                } catch (error) {
                    console.error('Error fetching customers:', error);
                }
            };
            fetchCustomers();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedCustomer && Number(amount) > Number(selectedCustomer.totalDebt)) {
            setError(`المبلغ المدفوع لا يمكن أن يتجاوز المستحق (${Number(selectedCustomer.totalDebt).toLocaleString()} ج.م)`);
            return;
        }

        setLoading(true);
        setError('');
        try {
            await (window as any).api.payments.addPayment({
                customerId: Number(customerId),
                amount: Number(amount),
                method,
                notes
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error adding payment:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm rtl">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl transform scale-100 transition-all duration-300">
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <h2 className="font-headline-lg text-on-surface">إضافة دفعة جديدة</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="px-8 py-6">
                    <form id="add-payment-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block font-label-md text-on-surface-variant">العميل</label>
                            <div className="relative">
                                <select 
                                    value={customerId} 
                                    onChange={e => {
                                        setCustomerId(e.target.value);
                                        setError('');
                                    }} 
                                    required 
                                    className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none transition-all font-body-md text-right border-slate-300"
                                >
                                    <option value="">اختر العميل</option>
                                    {customers.map(customer => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name} (المستحق: {Number(customer.totalDebt).toLocaleString()} ج.م)
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block font-label-md text-on-surface-variant">المبلغ</label>
                            <div className="relative">
                                <input 
                                    value={amount} 
                                    onChange={e => {
                                        setAmount(e.target.value);
                                        setError('');
                                    }} 
                                    required 
                                    className={`w-full h-12 pl-12 pr-4 rounded-xl border ${error ? 'border-red-500 focus:ring-red-200' : 'border-slate-300'} bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-data-tabular text-right`} 
                                    placeholder="0.00" 
                                    type="number" 
                                />
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-slate-400 text-xs font-bold">ج.م</span>
                                </div>
                            </div>
                            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block font-label-md text-on-surface-variant">طريقة الدفع</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setMethod('CASH')}
                                    className={`py-3 rounded-xl border font-label-md transition-all ${method === 'CASH' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    نقدي
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMethod('BANK')}
                                    className={`py-3 rounded-xl border font-label-md transition-all ${method === 'BANK' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    حوالة بنكية
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block font-label-md text-on-surface-variant">ملاحظات</label>
                            <textarea 
                                value={notes} 
                                onChange={e => setNotes(e.target.value)} 
                                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-md text-right border-slate-300" 
                                placeholder="أي ملاحظات إضافية..." 
                                rows={3}
                            ></textarea>
                        </div>
                    </form>
                </div>

                <div className="px-8 py-6 bg-slate-50 rounded-b-2xl flex flex-row-reverse gap-4">
                    <button 
                        type="submit" 
                        form="add-payment-form" 
                        disabled={loading}
                        className="flex-1 bg-primary text-white font-label-md py-4 rounded-xl shadow-lg hover:bg-blue-800 transition-all disabled:opacity-50"
                    >
                        {loading ? 'جاري الحفظ...' : 'تأكيد الإضافة'}
                    </button>
                    <button 
                        onClick={onClose} 
                        disabled={loading}
                        className="flex-1 bg-white border border-slate-300 text-slate-700 font-label-md py-4 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};
