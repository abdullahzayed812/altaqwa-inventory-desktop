import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="fixed top-0 left-0 right-64 h-16 flex items-center justify-between px-6 z-30 rtl bg-slate-50/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-black text-slate-900">شركة التقوى للمستلزمات الزراعية</h2>
                <div className="h-6 w-[1px] bg-slate-300 mx-2"></div>
                <div className="relative w-80">
                    <input className="w-full bg-white border-slate-200 rounded-full py-1.5 pr-10 pl-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="البحث في الطلبات، العملاء..." type="text" />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-slate-200/50 rounded-full transition-all text-slate-600">
                    <span className="material-symbols-outlined">notifications</span>
                </button>
                <button className="p-2 hover:bg-slate-200/50 rounded-full transition-all text-slate-600">
                    <span className="material-symbols-outlined">settings</span>
                </button>
                <button className="p-2 hover:bg-slate-200/50 rounded-full transition-all text-slate-600">
                    <span className="material-symbols-outlined">help</span>
                </button>
                <div className="flex items-center gap-2 pr-2 border-r border-slate-200 mr-2">
                    <span className="text-sm font-medium text-slate-700">الملف الشخصي</span>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <span className="material-symbols-outlined text-xl">person</span>
                    </div>
                </div>
            </div>
        </header>
    );
};
