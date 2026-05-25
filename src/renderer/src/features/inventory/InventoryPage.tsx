import React, { useState, useEffect } from 'react';
import { getProducts } from '../../api';
import { AddProductModal } from '../../modals/AddProductModal';
import { PrintPreviewModal } from '../../modals/PrintPreviewModal';

export const InventoryPage: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [printHtml, setPrintHtml] = useState('');

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (e) {
            console.error('Failed to load products');
        }
    };

    const handlePrint = async () => {
        try {
            const html = await window.api.print.generateHTML('products', products);
            setPrintHtml(html);
            setPreviewOpen(true);
        } catch (e) {
            console.error('Failed to generate print HTML');
        }
    };

    const executePrint = async () => {
        try {
            await window.api.print.doPrint(printHtml);
            setPreviewOpen(false);
        } catch (e) {
            console.error('Failed to print');
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    return (
        <div className="px-8 pb-12 rtl">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h3 className="font-headline-xl text-on-surface mb-1">قائمة المخزون</h3>
                    <p className="text-slate-500 font-body-md">إدارة وتتبع كميات الأعلاف المتوفرة في المستودعات المركزية.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-slate-700 font-label-md hover:bg-slate-50 transition-all">
                        <span className="material-symbols-outlined text-sm">print</span>
                        طباعة المخزون
                    </button>
                    <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-label-md hover:opacity-90 transition-all">
                        <span className="material-symbols-outlined">add</span>
                        إضافة منتج جديد
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-r-4 border-emerald-500">
                    <p className="text-slate-500 font-label-md mb-2">إجمالي الأصناف</p>
                    <p className="font-headline-lg text-on-surface">{products.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-r-4 border-amber-500">
                    <p className="text-slate-500 font-label-md mb-2">منتجات منخفضة المخزون</p>
                    <p className="font-headline-lg text-amber-600">{products.filter(p => p.stock < 10).length}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 font-label-md text-slate-600">رقم الصنف</th>
                                <th className="px-6 py-4 font-label-md text-slate-600">اسم المنتج</th>
                                <th className="px-6 py-4 font-label-md text-slate-600">السعر (ج.م)</th>
                                <th className="px-6 py-4 font-label-md text-slate-600">الكمية المتوفرة</th>
                                <th className="px-6 py-4 font-label-md text-slate-600">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-400">لا يوجد منتجات حالياً. أضف منتج جديد.</td>
                                </tr>
                            ) : products.map(product => (
                                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-data-tabular">#{product.id}</td>
                                    <td className="px-6 py-4 font-body-md font-medium">{product.name}</td>
                                    <td className="px-6 py-4 font-data-tabular font-bold">{product.price} ج.م</td>
                                    <td className={`px-6 py-4 font-bold font-data-tabular ${product.stock < 10 ? 'text-error' : 'text-on-surface'}`}>{product.stock}</td>
                                    <td className="px-6 py-4">
                                        {product.stock < 10 ? (
                                            <span className="px-3 py-1 rounded-full bg-error-container text-error text-xs font-bold">مخزون منخفض</span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">متوفر</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddProductModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSuccess={loadProducts} />
            <PrintPreviewModal isOpen={isPreviewOpen} onClose={() => setPreviewOpen(false)} html={printHtml} onPrint={executePrint} title="معاينة قائمة المخزون" />
        </div>
    );
};
