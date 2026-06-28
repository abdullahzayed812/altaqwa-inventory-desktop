import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../../api';
import { OrderStatus } from '../../types';
import { CreateOrderModal } from '../../modals/CreateOrderModal';
import { PrintPreviewModal } from '../../modals/PrintPreviewModal';

export const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [printHtml, setPrintHtml] = useState('');
    const [previewTitle, setPreviewTitle] = useState('معاينة الطباعة');

    const loadOrders = async () => {
        try {
            const data = await getOrders();
            setOrders(data);
        } catch (e) {
            console.error('Failed to load orders', e);
        }
    };

    const handlePrintList = async () => {
        try {
            const html = await window.api.print.generateHTML('orders', orders.filter(o => o.status !== 'CANCELLED'));
            setPrintHtml(html);
            setPreviewTitle('معاينة سجل الطلبات النشطة');
            setPreviewOpen(true);
        } catch (e) {
            console.error('Failed to generate orders list print', e);
        }
    };

    const handlePrintInvoice = async (order: any) => {
        try {
            const html = await window.api.print.generateHTML('invoice', order);
            setPrintHtml(html);
            setPreviewTitle(`معاينة فاتورة طلب #${order.orderNumber}`);
            setPreviewOpen(true);
        } catch (e) {
            console.error('Failed to generate invoice print', e);
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
        loadOrders();
    }, []);

    const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
        const statusText = newStatus === 'DELIVERED' ? 'تم التسليم' : 'إلغاء الطلب';
        if (!window.confirm(`هل أنت متأكد من تغيير حالة الطلب إلى "${statusText}"؟`)) return;
        try {
            await updateOrderStatus(orderId, newStatus);
            loadOrders();
        } catch (e) {
            console.error('Failed to update status', e);
        }
    };

    const activeOrders = orders.filter(o => o.status !== 'CANCELLED');
    const pendingOrders = activeOrders.filter(o => o.status === 'PENDING').length;
    const deliveredOrders = activeOrders.filter(o => o.status === 'DELIVERED').length;
    const cancelledOrdersCount = orders.filter(o => o.status === 'CANCELLED').length;

    return (
        <div className="px-8 pb-12 rtl">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h2 className="font-headline-xl text-on-background">إدارة الطلبات</h2>
                    <p className="font-body-md text-slate-500 mt-1">تتبع وإدارة جميع طلبات توريد الأعلاف</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handlePrintList} className="bg-white text-slate-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                        <span className="material-symbols-outlined text-sm">print</span>
                        طباعة السجل
                    </button>
                    <button onClick={() => setModalOpen(true)} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-all shadow-lg">
                        <span className="material-symbols-outlined">add_circle</span>
                        إنشاء طلب جديد
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                        <span className="material-symbols-outlined">shopping_cart</span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">إجمالي الطلبات النشطة</p>
                        <h3 className="text-2xl font-black text-slate-900">{activeOrders.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">pending_actions</span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">قيد الانتظار</p>
                        <h3 className="text-2xl font-black text-slate-900">{pendingOrders}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">تم التسليم</p>
                        <h3 className="text-2xl font-black text-slate-900">{deliveredOrders}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 border-r-4 border-r-red-500">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">cancel</span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">الطلبات الملغاة</p>
                        <h3 className="text-2xl font-black text-slate-900">{cancelledOrdersCount}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-700 text-label-md">رقم الطلب</th>
                            <th className="px-6 py-4 font-bold text-slate-700 text-label-md">العميل</th>
                            <th className="px-6 py-4 font-bold text-slate-700 text-label-md">الأصناف</th>
                            <th className="px-6 py-4 font-bold text-slate-700 text-label-md">التاريخ</th>
                            <th className="px-6 py-4 font-bold text-slate-700 text-label-md">الحالة</th>
                            <th className="px-6 py-4 font-bold text-slate-700 text-label-md text-center">الإجمالي</th>
                            <th className="px-6 py-4 font-bold text-slate-700 text-label-md text-left">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-slate-400">لا يوجد طلبات حالياً.</td>
                            </tr>
                        ) : orders.map(order => (
                            <tr key={order.id} className={`hover:bg-blue-50/30 transition-colors group ${order.status === 'CANCELLED' ? 'opacity-60 bg-slate-50/50' : ''}`}>
                                <td className="px-6 py-4 font-data-tabular font-bold text-slate-900">{order.orderNumber}</td>
                                <td className="px-6 py-4 text-body-md">{order.customer?.name}</td>
                                <td className="px-6 py-4 text-body-xs">
                                    <div className="flex flex-col gap-1">
                                        {order.items?.map((item: any) => (
                                            <div key={item.id} className="text-slate-600">
                                                {item.product?.name} ({item.quantity})
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-body-md text-slate-500">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {order.status === 'PENDING' ? 'قيد الانتظار' :
                                         order.status === 'DELIVERED' ? 'تم التسليم' : 'ملغي'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-center">{Number(order.totalAmount).toLocaleString()} ج.م</td>
                                <td className="px-6 py-4 text-left">
                                    <div className="flex items-center justify-end gap-1">
                                        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                            <>
                                                <button onClick={() => handleStatusUpdate(order.id, OrderStatus.DELIVERED)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="تحديد كمكتمل">
                                                    <span className="material-symbols-outlined">check_circle</span>
                                                </button>
                                                <button onClick={() => handleStatusUpdate(order.id, OrderStatus.CANCELLED)} className="p-1.5 text-error hover:bg-error-container/20 rounded-lg transition-all" title="إلغاء الطلب">
                                                    <span className="material-symbols-outlined">cancel</span>
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => handlePrintInvoice(order)} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-all" title="طباعة الفاتورة">
                                            <span className="material-symbols-outlined">print</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <CreateOrderModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSuccess={loadOrders} />
            <PrintPreviewModal isOpen={isPreviewOpen} onClose={() => setPreviewOpen(false)} html={printHtml} onPrint={executePrint} title={previewTitle} />
        </div>
    );
};
