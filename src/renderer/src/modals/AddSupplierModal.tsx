import React, { useState } from 'react';
import { createSupplier } from '../api';

interface AddSupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type BalanceType = 'دائن' | 'مدين';

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [balanceAmount, setBalanceAmount] = useState('');
    const [balanceType, setBalanceType] = useState<BalanceType>('دائن');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        setName(''); setPhone(''); setAddress(''); setBalanceAmount(''); setBalanceType('دائن');
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const amount = Number(balanceAmount) || 0;
            const initialBalance = balanceType === 'دائن' ? amount : -amount;
            await createSupplier({ name, phone: phone || undefined, address: address || undefined, initialBalance: initialBalance || undefined });
            onSuccess();
            handleClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rtl">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
                        </div>
                        <div>
                            <h3 className="font-headline-md text-on-surface text-lg font-bold">إضافة مورد جديد</h3>
                            <p className="text-sm text-slate-500">قم بإدخال بيانات المورد لإنشاء ملف تعريفي جديد</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-slate-400 hover:text-primary transition-colors p-1">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="px-8 py-8 space-y-5">
                    <form id="add-supplier-form" onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="font-label-md text-on-surface block">الاسم بالكامل <span className="text-red-500">*</span></label>
                            <input value={name} onChange={e => setName(e.target.value)} required className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md transition-all outline-none" placeholder="أدخل اسم المورد أو اسم الشركة" type="text" />
                        </div>

                        <div className="space-y-2">
                            <label className="font-label-md text-on-surface block">رقم الهاتف</label>
                            <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary font-body-md transition-all outline-none text-right" dir="ltr" placeholder="مثال: 01012345678" type="tel" />
                        </div>

                        <div className="space-y-2">
                            <label className="font-label-md text-on-surface block">العنوان</label>
                            <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary font-body-md transition-all outline-none resize-none" placeholder="المحافظة، المدينة، اسم الشارع" rows={2}></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="font-label-md text-on-surface block">الرصيد الافتتاحي</label>
                            <div className="flex gap-3 mb-2">
                                <button type="button" onClick={() => setBalanceType('دائن')}
                                    className={`flex-1 py-2 rounded-lg border font-bold text-sm transition-all ${balanceType === 'دائن' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                                    دائن (مستحق له)
                                </button>
                                <button type="button" onClick={() => setBalanceType('مدين')}
                                    className={`flex-1 py-2 rounded-lg border font-bold text-sm transition-all ${balanceType === 'مدين' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                                    مدين (عليه)
                                </button>
                            </div>
                            <input value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary font-body-md transition-all outline-none" placeholder="0.00 (اختياري)" type="number" min="0" step="0.01" />
                        </div>
                    </form>
                </div>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                    <button onClick={handleClose} disabled={loading} className="px-6 py-2.5 rounded-lg font-label-md text-slate-600 border border-slate-200 bg-white hover:bg-slate-100 transition-all">
                        إلغاء
                    </button>
                    <button type="submit" form="add-supplier-form" disabled={loading} className="px-8 py-2.5 rounded-lg font-label-md bg-primary text-white shadow-lg hover:bg-blue-800 transition-all flex items-center gap-2 disabled:opacity-50">
                        {loading ? 'جاري الحفظ...' : 'حفظ البيانات'}
                        {!loading && <span className="material-symbols-outlined text-[18px]">save</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};
