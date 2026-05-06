import React, { useState, useEffect } from 'react';

interface AssignDriverModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId?: number; // Might be passed from table
}

export const AssignDriverModal: React.FC<AssignDriverModalProps> = ({ isOpen, onClose, orderId }) => {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [selectedDriverId, setSelectedDriverId] = useState('');

    useEffect(() => {
        if (isOpen) {
            // @ts-ignore
            window.api.drivers.getDrivers().then(setDrivers).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        try {
            if (orderId && selectedDriverId) {
                // @ts-ignore
                await window.api.orders.assignDriver({ orderId, driverId: Number(selectedDriverId) });
            }
            onClose();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm rtl">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-700 font-variation-settings-fill-1">person_pin_circle</span>
                        </div>
                        <div>
                            <h2 className="font-headline-md text-primary font-bold">تعيين سائق للطلب</h2>
                            <p className="font-label-sm text-slate-500">الطلب: {orderId ? `#ORD-${orderId}` : 'حدد طلبك'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="font-label-md block font-bold text-slate-700">اختر السائق المتاح</label>
                        <div className="relative group">
                            <select value={selectedDriverId} onChange={e => setSelectedDriverId(e.target.value)} className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md outline-none bg-white">
                                <option value="" disabled>-- اختر من القائمة --</option>
                                {drivers.map(d => (
                                    <option key={d.id} value={d.id}>{d.name} ({d.vehicleDetails})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-white text-slate-600 border border-slate-300 px-6 py-2.5 rounded-lg hover:bg-slate-100 transition-all">
                        إلغاء
                    </button>
                    <button onClick={handleSubmit} className="bg-primary text-white px-8 py-2.5 rounded-lg shadow-lg hover:bg-blue-800 transition-all">
                        تأكيد التعيين
                    </button>
                </div>
            </div>
        </div>
    );
};
