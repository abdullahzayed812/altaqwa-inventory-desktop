import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDrivers, deleteDriver } from '../../api';
import { AddDriverModal } from '../../modals/AddDriverModal';

export const DriversPage: React.FC = () => {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    const loadDrivers = async () => {
        try {
            const data = await getDrivers();
            setDrivers(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (driver: any) => {
        if (!window.confirm(`هل أنت متأكد من حذف السائق "${driver.name}"؟`)) return;
        try {
            await deleteDriver(driver.id);
            loadDrivers();
        } catch (err: any) {
            alert(err.message || 'فشل حذف السائق');
        }
    };

    useEffect(() => {
        loadDrivers();
    }, []);

    const filtered = drivers.filter(d => {
        const q = search.toLowerCase();
        return !q || d.name.toLowerCase().includes(q) || (d.phone || '').includes(q) || (d.vehiclePlate || '').toLowerCase().includes(q);
    });

    return (
        <div className="px-8 pb-12 rtl">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h3 className="font-headline-xl text-on-surface mb-2">إدارة السائقين</h3>
                    <p className="text-slate-500 font-body-md">إدارة وتتبع أداء السائقين وعقود التوصيل الخاصة بالمستودع.</p>
                </div>
                <button onClick={() => setAddModalOpen(true)} className="bg-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 font-label-md shadow-lg shadow-blue-900/10 hover:bg-blue-800 transition-all">
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
                        <p className="text-3xl font-bold text-on-surface">{drivers.filter(d => d.isAvailable).length}</p>
                    </div>
                    <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                        <span className="material-symbols-outlined text-3xl">local_shipping</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h4 className="font-headline-md text-on-surface">قائمة السائقين</h4>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">search</span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="بحث بالاسم أو الهاتف أو اللوحة..."
                            className="w-64 h-10 pr-10 pl-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-secondary font-label-sm uppercase tracking-wider border-b border-slate-100">اسم السائق</th>
                                <th className="px-6 py-4 text-secondary font-label-sm uppercase tracking-wider border-b border-slate-100">رقم الهاتف</th>
                                <th className="px-6 py-4 text-secondary font-label-sm uppercase tracking-wider border-b border-slate-100">لوحة المركبة</th>
                                <th className="px-6 py-4 text-secondary font-label-sm uppercase tracking-wider border-b border-slate-100">الرصيد</th>
                                <th className="px-6 py-4 text-secondary font-label-sm uppercase tracking-wider border-b border-slate-100 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-400">
                                        {search ? `لا توجد نتائج لـ "${search}"` : 'لا يوجد سائقين حالياً.'}
                                    </td>
                                </tr>
                            ) : filtered.map(driver => (
                                <tr key={driver.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-on-surface">{driver.name}</div>
                                    </td>
                                    <td className="px-6 py-4 font-data-tabular opacity-80">{driver.phone || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                                            {driver.vehiclePlate || driver.vehicleDetails || '-'}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 font-bold font-data-tabular ${Number(driver.totalBalance) > 0 ? 'text-blue-600' : Number(driver.totalBalance) < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                                        {Number(driver.totalBalance) < 0
                                            ? `مدين: ${Math.abs(Number(driver.totalBalance)).toLocaleString()} ج.م`
                                            : `${Number(driver.totalBalance).toLocaleString()} ج.م`
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link to={`/drivers/${driver.id}`} className="px-3 py-1 text-primary hover:bg-primary/10 rounded-lg text-sm font-bold transition-all">
                                                التفاصيل
                                            </Link>
                                            <button onClick={() => handleDelete(driver)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="حذف">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddDriverModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onSuccess={loadDrivers} />
        </div>
    );
};
