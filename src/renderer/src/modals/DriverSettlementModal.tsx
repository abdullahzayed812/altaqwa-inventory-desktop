import React, { useState } from 'react';

interface DriverSettlementModalProps {
    isOpen: boolean;
    onClose: () => void;
    driverId?: number;
}

export const DriverSettlementModal: React.FC<DriverSettlementModalProps> = ({ isOpen, onClose, driverId }) => {
    const [paidAmount, setPaidAmount] = useState(0);

    if (!isOpen) return null;

    const handleSettle = () => {
        // Settle logic here - integrating with Payments / Drivers
        console.log("Settled", paidAmount, "for driver", driverId);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 rtl">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 border-t">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                        </div>
                        <div>
                            <h2 className="font-headline-lg text-blue-900 font-bold">تسوية حساب السائق</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-8">
                    <div className="space-y-4">
                        <label className="block font-label-md text-on-surface font-bold">المبلغ المدفوع للسائق فعلياً (ج.م)</label>
                        <div className="relative group">
                            <input value={paidAmount} onChange={e => setPaidAmount(Number(e.target.value))} className="w-full h-16 text-3xl font-bold px-6 bg-white border-2 border-slate-200 rounded-xl focus:border-primary outline-none text-left" type="number" dir="ltr" />
                            <div className="absolute top-1/2 -translate-y-1/2 right-6 text-slate-400 font-bold text-xl">ج.م</div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 border-t border-slate-100 flex gap-4 bg-slate-50">
                    <button onClick={handleSettle} className="flex-1 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-all">
                        <span className="material-symbols-outlined">verified_user</span>
                        تأكيد التسوية المالية
                    </button>
                    <button onClick={onClose} className="px-8 py-4 bg-white border border-slate-300 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all">
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};
