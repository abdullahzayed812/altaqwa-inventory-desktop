import React, { useState } from 'react';

interface AddDriverModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddDriverModal: React.FC<AddDriverModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [vehicleInfo, setVehicleInfo] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // @ts-ignore
            await window.api.drivers.addDriver({
                name,
                phone,
                licenseNumber,
                vehicleInfo,
                isAvailable: true
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rtl">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
                        </div>
                        <div>
                            <h3 className="font-headline-md text-on-surface text-lg font-bold">إضافة سائق جديد</h3>
                            <p className="text-sm text-slate-500">قم بإدخال بيانات السائق الجديد</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-primary transition-colors p-1">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="px-8 py-8 space-y-6">
                    <form id="add-driver-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="font-label-md text-on-surface block">الاسم بالكامل <span className="text-red-500">*</span></label>
                            <input value={name} onChange={e => setName(e.target.value)} required className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md transition-all outline-none" placeholder="أدخل اسم السائق" type="text" />
                        </div>

                        <div className="space-y-2">
                            <label className="font-label-md text-on-surface block">رقم الهاتف <span className="text-red-500">*</span></label>
                            <input value={phone} onChange={e => setPhone(e.target.value)} required className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md transition-all outline-none text-right" dir="ltr" placeholder="مثال: 01012345678" type="tel" />
                        </div>

                        <div className="space-y-2">
                            <label className="font-label-md text-on-surface block">رقم الرخصة</label>
                            <input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md transition-all outline-none" placeholder="رقم رخصة القيادة" type="text" />
                        </div>

                        <div className="space-y-2">
                            <label className="font-label-md text-on-surface block">بيانات المركبة</label>
                            <input value={vehicleInfo} onChange={e => setVehicleInfo(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md transition-all outline-none" placeholder="مثال: نقل جامبو - 1234 أ ب ج" type="text" />
                        </div>
                    </form>
                </div>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                    <button onClick={onClose} disabled={loading} className="px-6 py-2.5 rounded-lg font-label-md text-slate-600 border border-slate-200 bg-white hover:bg-slate-100 transition-all">
                        إلغاء
                    </button>
                    <button type="submit" form="add-driver-form" disabled={loading} className="px-8 py-2.5 rounded-lg font-label-md bg-primary text-white shadow-lg hover:bg-blue-800 transition-all flex items-center gap-2">
                        {loading ? 'جاري الحفظ...' : 'حفظ البيانات'}
                        {!loading && <span className="material-symbols-outlined text-[18px]">save</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};
