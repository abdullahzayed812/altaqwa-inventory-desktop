import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export const Sidebar: React.FC = () => {
    const [backing, setBacking] = useState(false);
    const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');

    const handleExport = async () => {
        setBacking(true);
        setStatus('idle');
        try {
            const result = await (window as any).api.backup.export();
            setStatus(result.success ? 'ok' : 'idle');
        } catch {
            setStatus('err');
        } finally {
            setBacking(false);
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const getNavClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ` +
        (isActive
            ? `text-blue-700 dark:text-blue-300 font-bold border-r-4 border-blue-700 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20`
            : `text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50`);

    return (
        <aside className="fixed right-0 top-0 h-full z-40 flex flex-col rtl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-64">
            <div className="p-6">
                <h1 className="text-xl font-bold text-blue-800 dark:text-blue-400 leading-tight">شركة التقوى</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">للمستلزمات الزراعية</p>
            </div>
            <nav className="flex-1 px-4 space-y-2 mt-4">
                <NavLink to="/" className={getNavClass}>
                    <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                    <span className="font-label-md text-label-md">لوحة القيادة</span>
                </NavLink>
                <NavLink to="/inventory" className={getNavClass}>
                    <span className="material-symbols-outlined" data-icon="inventory_2">inventory_2</span>
                    <span className="font-label-md text-label-md">المخزون</span>
                </NavLink>
                <NavLink to="/customers" className={getNavClass}>
                    <span className="material-symbols-outlined" data-icon="groups">groups</span>
                    <span className="font-label-md text-label-md">العملاء</span>
                </NavLink>
                <NavLink to="/suppliers" className={getNavClass}>
                    <span className="material-symbols-outlined" data-icon="inventory">inventory</span>
                    <span className="font-label-md text-label-md">الموردين</span>
                </NavLink>
                <NavLink to="/orders" className={getNavClass}>
                    <span className="material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span>
                    <span className="font-label-md text-label-md">الطلبات</span>
                </NavLink>
                <NavLink to="/drivers" className={getNavClass}>
                    <span className="material-symbols-outlined" data-icon="local_shipping">local_shipping</span>
                    <span className="font-label-md text-label-md">السائقين</span>
                </NavLink>
                <NavLink to="/payments" className={getNavClass}>
                    <span className="material-symbols-outlined" data-icon="payments">payments</span>
                    <span className="font-label-md text-label-md">المدفوعات</span>
                </NavLink>
                <NavLink to="/reports" className={getNavClass}>
                    <span className="material-symbols-outlined" data-icon="assessment">assessment</span>
                    <span className="font-label-md text-label-md">التقارير</span>
                </NavLink>
            </nav>

            <div className="px-4 pb-3 space-y-2">
                <button
                    onClick={async () => {
                        if (window.confirm('هل تريد حقاً إضافة بيانات تجريبية؟ لن يتم حذف بياناتك الحالية.')) {
                            // @ts-ignore
                            await window.api.utils.seed();
                            window.location.reload();
                        }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-xs text-amber-600 bg-amber-50 hover:bg-amber-100 font-bold"
                >
                    <span className="material-symbols-outlined text-sm">database</span>
                    <span>إضافة بيانات تجريبية</span>
                </button>

                <button
                    onClick={handleExport}
                    disabled={backing}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50"
                >
                    <span className="material-symbols-outlined">
                        {backing ? 'hourglass_top' : status === 'ok' ? 'check_circle' : status === 'err' ? 'error' : 'backup'}
                    </span>
                    <span className="font-label-md text-label-md">
                        {backing ? 'جارٍ التصدير...' : status === 'ok' ? 'تم الحفظ' : status === 'err' ? 'فشل التصدير' : 'تصدير النسخة الاحتياطية'}
                    </span>
                </button>
            </div>

            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">A</div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-slate-900">أحمد محمد</p>
                        <p className="text-[10px] text-slate-500">مدير المستودع</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-sm cursor-pointer">logout</span>
                </div>
            </div>
        </aside>
    );
};
