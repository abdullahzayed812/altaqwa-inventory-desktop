import React, { useState } from 'react';
import { createProduct } from '../api';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [sellPrice, setSellPrice] = useState('');
    const [stock, setStock] = useState('0');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createProduct({
                name,
                price: Number(sellPrice),
                stock: Number(stock),
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm rtl">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined">add_box</span>
                        </div>
                        <h2 className="font-headline-lg text-on-surface">إضافة منتج جديد</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="px-8 py-6">
                    <form id="add-product-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block font-label-md text-on-surface-variant">اسم المنتج</label>
                            <input value={name} onChange={e => setName(e.target.value)} required className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-md text-right" placeholder="مثال: علف دواجن ممتاز" type="text" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block font-label-md text-on-surface-variant">سعر البيع</label>
                                <div className="relative">
                                    <input value={sellPrice} onChange={e => setSellPrice(e.target.value)} required className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-data-tabular text-right" placeholder="0.00" type="number" min="0" step="0.01" />
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-slate-400 text-xs font-bold">ج.م</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block font-label-md text-on-surface-variant">الكمية الافتتاحية</label>
                                <input value={stock} onChange={e => setStock(e.target.value)} required className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-data-tabular text-right" placeholder="0" type="number" min="0" />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-8 py-6 bg-slate-50 rounded-b-2xl flex flex-row-reverse gap-4">
                    <button type="submit" form="add-product-form" disabled={loading} className="flex-1 bg-primary text-white font-label-md py-4 rounded-xl shadow-lg hover:bg-blue-800 transition-all disabled:opacity-50">
                        {loading ? 'جاري الحفظ...' : 'تأكيد الإضافة'}
                    </button>
                    <button onClick={onClose} disabled={loading} className="flex-1 bg-white border border-slate-300 text-slate-700 font-label-md py-4 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50">
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};
