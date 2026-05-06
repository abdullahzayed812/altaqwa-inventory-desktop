import React, { useEffect, useState } from 'react';

export const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await (window as any).api.dashboard.getStats();
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;
    if (!stats) return <div className="p-8 text-center text-error">فشل في تحميل البيانات</div>;

    return (
        <div className="p-gutter max-w-7xl mx-auto space-y-gutter">
            {/* Summary Bento Grid */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-card-gap">
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
                            <span className="material-symbols-outlined">analytics</span>
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+100%</span>
                    </div>
                    <div className="mt-4">
                        <p className="font-label-md text-slate-500">إجمالي المبيعات</p>
                        <h3 className="font-headline-lg text-primary mt-1">{stats.totalSales.toLocaleString()} ج.م</h3>
                    </div>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                            <span className="material-symbols-outlined" data-weight="fill">payments</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">اليوم</span>
                    </div>
                    <div className="mt-4">
                        <p className="font-label-md text-slate-500">المدفوعات المحصلة</p>
                        <h3 className="font-headline-lg text-on-surface mt-1">{stats.totalPayments.toLocaleString()} ج.م</h3>
                    </div>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
                            <span className="material-symbols-outlined">account_balance_wallet</span>
                        </div>
                        <span className="text-xs font-bold text-error bg-error-container px-2 py-1 rounded-full">مستحق</span>
                    </div>
                    <div className="mt-4">
                        <p className="font-label-md text-slate-500">الأرصدة المستحقة</p>
                        <h3 className="font-headline-lg text-on-surface mt-1">{stats.totalDebt.toLocaleString()} ج.م</h3>
                    </div>
                </div>

                <div className={`bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between ${stats.lowStockCount > 0 ? 'border-r-4 border-r-error' : ''}`}>
                    <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg ${stats.lowStockCount > 0 ? 'bg-red-50 text-error' : 'bg-green-50 text-green-700'}`}>
                            <span className="material-symbols-outlined">{stats.lowStockCount > 0 ? 'warning' : 'check_circle'}</span>
                        </div>
                        {stats.lowStockCount > 0 && <span className="text-xs font-bold text-error">عاجل</span>}
                    </div>
                    <div className="mt-4">
                        <p className="font-label-md text-slate-500">تنبيهات انخفاض المخزون</p>
                        <h3 className={`font-headline-lg mt-1 ${stats.lowStockCount > 0 ? 'text-error' : 'text-on-surface'}`}>{stats.lowStockCount} أصناف</h3>
                    </div>
                </div>
            </section>

            {/* Tables and Charts (Simplified for Component) */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">
                <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-headline-md text-on-surface">إحصائيات المبيعات</h4>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4 px-2">
                        {/* If we have monthly data, use it, otherwise show placeholders */}
                        {(stats.monthlySales.length > 0 ? stats.monthlySales : [40, 60, 85, 50, 95, 30, 70]).map((m: any, i: number) => {
                            const height = typeof m === 'number' ? m : (m.total / (stats.totalSales || 1)) * 100;
                            return (
                                <div key={i} className="w-full bg-primary-container/10 rounded-t-lg relative group" style={{ height: `100%` }}>
                                    <div className="absolute inset-x-0 bottom-0 bg-primary-container rounded-t-lg transition-all" style={{ height: `${Math.min(100, Math.max(10, height))}%` }}></div>
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {typeof m === 'number' ? '' : `${m.total.toLocaleString()} ج.م`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col">
                    <h4 className="font-headline-md text-on-surface mb-6">الأصناف (مستوى المخزون)</h4>
                    <div className="space-y-4 flex-1">
                        {stats.topProducts.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">inventory_2</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                    <p className="text-[10px] text-slate-500">المخزون: {item.stock} طن</p>
                                </div>
                                <div className="text-left">
                                    <span className={`text-xs font-bold ${item.stock < 10 ? 'text-error' : 'text-blue-700'}`}>{item.stock}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
