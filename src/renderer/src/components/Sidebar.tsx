import React from 'react';
import { NavLink } from 'react-router-dom';

export const Sidebar: React.FC = () => {
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
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="font-label-md text-label-md">لوحة القيادة</span>
                </NavLink>
                <NavLink to="/inventory" className={getNavClass}>
                    <span className="material-symbols-outlined">inventory_2</span>
                    <span className="font-label-md text-label-md">المخزون</span>
                </NavLink>
                <NavLink to="/customers" className={getNavClass}>
                    <span className="material-symbols-outlined">groups</span>
                    <span className="font-label-md text-label-md">العملاء</span>
                </NavLink>
                <NavLink to="/suppliers" className={getNavClass}>
                    <span className="material-symbols-outlined">inventory</span>
                    <span className="font-label-md text-label-md">الموردين</span>
                </NavLink>
                <NavLink to="/orders" className={getNavClass}>
                    <span className="material-symbols-outlined">shopping_cart</span>
                    <span className="font-label-md text-label-md">الطلبات</span>
                </NavLink>
                <NavLink to="/drivers" className={getNavClass}>
                    <span className="material-symbols-outlined">local_shipping</span>
                    <span className="font-label-md text-label-md">السائقين</span>
                </NavLink>
                <NavLink to="/payments" className={getNavClass}>
                    <span className="material-symbols-outlined">payments</span>
                    <span className="font-label-md text-label-md">المدفوعات</span>
                </NavLink>
                <NavLink to="/reports" className={getNavClass}>
                    <span className="material-symbols-outlined">assessment</span>
                    <span className="font-label-md text-label-md">التقارير</span>
                </NavLink>
            </nav>

            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">A</div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-slate-900">أحمد محمد</p>
                        <p className="text-[10px] text-slate-500">مدير المستودع</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
