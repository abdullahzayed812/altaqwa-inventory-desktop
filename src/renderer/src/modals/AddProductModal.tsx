import React, { useState } from 'react';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [sellPrice, setSellPrice] = useState('');
    const [stock, setStock] = useState('0');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // @ts-ignore
            await window.api.inventory.addProduct({
                name,
                unit,
                price: Number(sellPrice), // Note: Domain requires price, stock, imagePath. Will map accordingly.
                stock: Number(stock),
                imagePath: '/assets/images/placeholder.png' // Default placeholder
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm rtl">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl transform scale-100 transition-all duration-300">
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
                            <input value={name} onChange={e => setName(e.target.value)} required className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-md text-right border-slate-300" placeholder="مثال: شاي أسود ممتاز" type="text" />
                        </div>

                        <div className="space-y-2">
                            <label className="block font-label-md text-on-surface-variant">الوحدة</label>
                            <div className="relative">
                                <select value={unit} onChange={e => setUnit(e.target.value)} required className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none transition-all font-body-md text-right border-slate-300">
                                    <option disabled value="">اختر الوحدة</option>
                                    <option value="ton">طن (Ton)</option>
                                    <option value="kg">كيلو جرام (Kg)</option>
                                    <option value="bag">جوال / شيكارة (Bag)</option>
                                </select>
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                                    <span class="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block font-label-md text-on-surface-variant">سعر الشراء</label>
                                <div className="relative">
                                    <input value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} required className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-data-tabular text-right border-slate-300" placeholder="0.00" type="number" />
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-slate-400 text-xs font-bold">ج.م</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block font-label-md text-on-surface-variant">سعر البيع</label>
                                <div className="relative">
                                    <input value={sellPrice} onChange={e => setSellPrice(e.target.value)} required className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-data-tabular text-right border-slate-300" placeholder="0.00" type="number" />
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-slate-400 text-xs font-bold">ج.م</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="block font-label-md text-on-surface-variant">الكمية الافتتاحية</label>
                                <div className="relative">
                                    <input value={stock} onChange={e => setStock(e.target.value)} required className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-data-tabular text-right border-slate-300" placeholder="0" type="number" />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-8 py-6 bg-slate-50 rounded-b-2xl flex flex-row-reverse gap-4">
                    <button type="submit" form="add-product-form" className="flex-1 bg-primary text-white font-label-md py-4 rounded-xl shadow-lg hover:bg-blue-800 transition-all">
                        تأكيد الإضافة
                    </button>
                    <button onClick={onClose} className="flex-1 bg-white border border-slate-300 text-slate-700 font-label-md py-4 rounded-xl hover:bg-slate-100 transition-all">
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};
