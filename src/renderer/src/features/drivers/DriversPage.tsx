import React, { useState, useEffect } from 'react';
import { AssignDriverModal } from '../../modals/AssignDriverModal';
import { AddDriverModal } from '../../modals/AddDriverModal';

export const DriversPage: React.FC = () => {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    const loadDrivers = async () => {
        try {
            // @ts-ignore
            const data = await window.api.drivers.getDrivers();
            setDrivers(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadDrivers();
    }, []);

    return (
        <div className="px-8 pb-12 rtl">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h3 className="font-headline-xl text-on-surface mb-2">إدارة السائقين</h3>
                    <p className="text-slate-500 font-body-md">إدارة وتتبع أداء السائقين وعقود التوصيل الخاصة بالمستودع.</p>
                </div>
                <button 
                    onClick={() => setAddModalOpen(true)}
                    className="bg-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 font-label-md shadow-lg shadow-blue-900/10 hover:bg-blue-800 transition-all"
                >
                    <span className="material-symbols-outlined">person_add</span>
                    إضافة سائق جديد
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-secondary text-label-sm mb-1 uppercase">إجمالي السائقين</p>
                        <p className="text-3xl font-bold text-on-surface">{drivers.length}</p>
                    </div>
                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-700">
                        <span className="material-symbols-outlined text-3xl">group</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-secondary text-label-sm mb-1 uppercase">سائقين متاحين</p>
                        <p className="text-3xl font-bold text-on-surface">{drivers.filter(d => true).length}</p>
                    </div>
                    <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                        <span className="material-symbols-outlined text-3xl">local_shipping</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h4 className="font-headline-md text-on-surface">قائمة السائقين</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-secondary font-label-sm uppercase tracking-wider border-b border-slate-100">اسم السائق</th>
                                <th className="px-6 py-4 text-secondary font-label-sm uppercase tracking-wider border-b border-slate-100">رقم الهاتف</th>
                                <th className="px-6 py-4 text-secondary font-label-sm uppercase tracking-wider border-b border-slate-100">رقم الرخصة</th>
                                <th className="px-6 py-4 text-secondary font-label-sm uppercase tracking-wider border-b border-slate-100">المركبة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {drivers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-slate-400">لا يوجد سائقين حالياً.</td>
                                </tr>
                            ) : drivers.map((driver) => (
                                <tr key={driver.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-on-surface">{driver.name}</div>
                                    </td>
                                    <td className="px-6 py-4 font-data-tabular opacity-80">{driver.phone}</td>
                                    <td className="px-6 py-4 font-data-tabular opacity-80">{driver.licenseNumber}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">{driver.vehicleInfo}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AssignDriverModal isOpen={isAssignModalOpen} onClose={() => setAssignModalOpen(false)} />
            <AddDriverModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onSuccess={loadDrivers} />
        </div>
    );
};
