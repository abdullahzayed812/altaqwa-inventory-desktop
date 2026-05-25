import React, { useEffect, useState } from 'react';
import { getReportData } from '../../api';
import { PrintPreviewModal } from '../../modals/PrintPreviewModal';

export const ReportsPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [printHtml, setPrintHtml] = useState('');

    const handlePrint = async () => {
        try {
            const html = await window.api.print.generateHTML('report', data);
            setPrintHtml(html);
            setPreviewOpen(true);
        } catch (e) {
            console.error('Failed to generate report print', e);
        }
    };

    const executePrint = async () => {
        try {
            await window.api.print.doPrint(printHtml);
            setPreviewOpen(false);
        } catch (e) {
            console.error('Failed to print', e);
        }
    };

    useEffect(() => {
        getReportData()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;
    if (!data) return <div className="p-8 text-center text-error">فشل في تحميل البيانات</div>;

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="font-headline-xl text-on-surface">التقارير التحليلية</h2>
                <div className="flex gap-3">
                    <button onClick={handlePrint} className="flex items-center gap-2 border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-label-md hover:bg-slate-50 transition-all">
                        <span className="material-symbols-outlined">print</span>
                        <span>طباعة التقرير / PDF</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-headline-md font-headline-md text-on-surface">تقارير المبيعات (آخر 7 أيام)</h3>
                    </div>
                    <div className="flex-grow flex items-end justify-between gap-4 h-48 px-4">
                        {data.recentSales.map((s: any, i: number) => {
                            const maxVal = Math.max(...data.recentSales.map((x: any) => x.total), 1);
                            const height = (s.total / maxVal) * 100;
                            return (
                                <div key={i} className="w-full bg-slate-50 rounded-t-lg relative group h-full">
                                    <div className="absolute bottom-0 w-full bg-primary/60 rounded-t-lg transition-all duration-500" style={{ height: `${Math.max(10, height)}%` }}></div>
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {s.total.toLocaleString()} ج.م
                                    </div>
                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[8px] text-slate-400 rotate-45 origin-top-left">
                                        {new Date(s.date).toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 bg-primary-container text-on-primary-container p-6 rounded-3xl relative overflow-hidden shadow-lg border border-primary/20">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-headline-md font-headline-md">ملخص الأرباح</span>
                            <span className="bg-white/20 p-2 rounded-xl material-symbols-outlined">trending_up</span>
                        </div>
                        <div className="mb-4">
                            <p className="text-label-md opacity-70">إجمالي المبيعات المحققة</p>
                            <h3 className="text-headline-xl font-headline-xl">
                                {data.recentSales.reduce((acc: number, curr: any) => acc + Number(curr.total), 0).toLocaleString()} ج.م
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-headline-md font-headline-md text-on-surface">أرصدة العملاء (الأكثر مديونية)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="text-label-sm text-outline border-b border-slate-50">
                                    <th className="pb-4 pr-2">العميل</th>
                                    <th className="pb-4">رقم الهاتف</th>
                                    <th className="pb-4">الرصيد المستحق</th>
                                    <th className="pb-4">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="text-body-md divide-y divide-slate-50">
                                {data.customerBalances.map((customer: any) => (
                                    <tr key={customer.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="py-4 pr-2 font-medium">{customer.name}</td>
                                        <td className="py-4 text-slate-500">{customer.phone || '-'}</td>
                                        <td className="py-4 font-data-tabular text-error">{Number(customer.totalDebt).toLocaleString()} ج.م</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 text-label-sm rounded-lg ${Number(customer.totalDebt) > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {Number(customer.totalDebt) > 0 ? 'عليه مستحقات' : 'خالص'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <PrintPreviewModal isOpen={isPreviewOpen} onClose={() => setPreviewOpen(false)} html={printHtml} onPrint={executePrint} title="معاينة التقرير التحليلي" />
        </div>
    );
};
