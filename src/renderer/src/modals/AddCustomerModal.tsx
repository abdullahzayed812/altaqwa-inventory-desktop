import React, { useState } from 'react';
import { createCustomer } from '../api';

interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type BalanceType = 'مدين' | 'دائن';

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [type, setType] = useState<'customer' | 'driver'>('customer');
    const [vehiclePlate, setVehiclePlate] = useState('');
    const [vehicleDetails, setVehicleDetails] = useState('');
    const [balanceAmount, setBalanceAmount] = useState('');
    const [balanceType, setBalanceType] = useState<BalanceType>('مدين');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        setName(''); setPhone(''); setAddress(''); setBalanceAmount(''); setBalanceType('مدين');
        setType('customer'); setVehiclePlate(''); setVehicleDetails('');
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const amount = Number(balanceAmount) || 0;
            const initialDebt = balanceType === 'مدين' ? amount : -amount;
            await createCustomer({
                name,
                phone: phone || undefined,
                address: address || undefined,
                initialDebt: initialDebt || undefined,
                type,
                vehiclePlate: type === 'driver' ? (vehiclePlate || undefined) : undefined,
                vehicleDetails: type === 'driver' ? (vehicleDetails || undefined) : undefined,
            });
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
                            <h3 className="font-headline-md text-on-surface text-lg font-bold">إضافة عميل / سائق جديد</h3>
                            <p className="text-sm text-slate-500">قم بإدخال البيانات لإنشاء ملف تعريفي جديد</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-slate-400 hover:text-primary transition-colors p-1">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="px-8 py-8 space-y-5 max-h-[70vh] overflow-y-auto">
                    <form id="add-customer-form" onSubmit={handleSubmit} className="space-y-5">

                        <div className="space-y-2">
                            <label className="font-label-md text-on-surface block">النوع</label>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setType('customer')}
                                    className={`flex-1 py-2 rounded-lg border font-bold text-sm transition-all ${type === 'customer' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                                    عميل
                                </button>
                                <button type="button" onClick={() => setType('driver')}
                                    className={`flex-1 py-2 rounded-lg border font-bold text-sm transition-all ${type === 'driver' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                                    سائق
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="font-label-md text-on-surface block">الاسم بالكامل <span className="text-red-500">*</span></label>
                            <input value={name} onChange={e => setName(e.target.value)} required className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md transition-all outline-none" placeholder="أدخل الاسم" type="text" />
                        </div>

                        <div className="space-y-2">
                            <label className="font-label-md text-on-surface block">رقم الهاتف</label>
                            <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md transition-all outline-none text-right" dir="ltr" placeholder="مثال: 01012345678" type="tel" />
                        </div>

                        <div className="space-y-2">
                            <label className="font-label-md text-on-surface block">العنوان</label>
                            <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md transition-all outline-none resize-none" placeholder="المحافظة، المدينة، اسم الشارع" rows={2}></textarea>
                        </div>

                        {type === 'driver' && (
                            <>
                                <div className="space-y-2">
                                    <label className="font-label-md text-on-surface block">رقم اللوحة</label>
                                    <input value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary font-body-md transition-all outline-none" placeholder="مثال: أ ب ج 1234" type="text" />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-label-md text-on-surface block">تفاصيل السيارة</label>
                                    <input value={vehicleDetails} onChange={e => setVehicleDetails(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary font-body-md transition-all outline-none" placeholder="مثال: كيا بيكس 2020" type="text" />
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <label className="font-label-md text-on-surface block">الرصيد الافتتاحي</label>
                            <div className="flex gap-3 mb-2">
                                <button type="button" onClick={() => setBalanceType('مدين')}
                                    className={`flex-1 py-2 rounded-lg border font-bold text-sm transition-all ${balanceType === 'مدين' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                                    مدين (عليه)
                                </button>
                                <button type="button" onClick={() => setBalanceType('دائن')}
                                    className={`flex-1 py-2 rounded-lg border font-bold text-sm transition-all ${balanceType === 'دائن' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                                    دائن (له)
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
                    <button type="submit" form="add-customer-form" disabled={loading} className="px-8 py-2.5 rounded-lg font-label-md bg-primary text-white shadow-lg hover:bg-blue-800 transition-all flex items-center gap-2 disabled:opacity-50">
                        {loading ? 'جاري الحفظ...' : 'حفظ البيانات'}
                        {!loading && <span className="material-symbols-outlined text-[18px]">save</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};
