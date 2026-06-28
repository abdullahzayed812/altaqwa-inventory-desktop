import React, { useState, useEffect } from 'react';
import { getPurchaseById, getProducts, updatePurchase } from '../api';

interface EditPurchaseModalProps {
    isOpen: boolean;
    purchaseId: number | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const EditPurchaseModal: React.FC<EditPurchaseModalProps> = ({ isOpen, purchaseId, onClose, onSuccess }) => {
    const [products, setProducts] = useState<any[]>([]);
    const [items, setItems] = useState<{ productId: number; quantity: number; price: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen || !purchaseId) return;
        setLoading(true);
        setError('');
        Promise.all([getProducts(), getPurchaseById(purchaseId)])
            .then(([prods, purchase]) => {
                setProducts(prods);
                setItems((purchase.items ?? []).map((i: any) => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    price: i.price,
                })));
            })
            .catch(() => setError('فشل تحميل بيانات الفاتورة'))
            .finally(() => setLoading(false));
    }, [isOpen, purchaseId]);

    if (!isOpen) return null;

    const addItem = () => setItems([...items, { productId: 0, quantity: 1, price: 0 }]);
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const updateItem = (index: number, field: string, value: any) => {
        const next = [...items];
        next[index] = { ...next[index], [field]: value };
        if (field === 'productId') {
            const p = products.find(p => p.id === Number(value));
            if (p) next[index].price = p.price;
        }
        setItems(next);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!purchaseId || items.length === 0) return;
        const valid = items.every(i => i.productId > 0 && i.quantity > 0 && i.price > 0);
        if (!valid) { setError('تأكد من اختيار الصنف وإدخال الكمية والسعر لكل صنف'); return; }
        setSaving(true);
        setError('');
        try {
            await updatePurchase(purchaseId, {
                items: items.map(i => ({
                    productId: Number(i.productId),
                    quantity: Number(i.quantity),
                    price: Number(i.price),
                })),
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'فشل تحديث الفاتورة');
        } finally {
            setSaving(false);
        }
    };

    const totalAmount = items.reduce((s, i) => s + i.quantity * i.price, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rtl">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">edit</span>
                        تعديل فاتورة الشراء #{purchaseId}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-primary">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-400">جاري التحميل...</div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="px-8 py-6 space-y-4 max-h-[65vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-2">
                                <button onClick={addItem} type="button" className="text-primary flex items-center gap-1 text-sm font-bold hover:underline">
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    إضافة صنف
                                </button>
                                <span className="text-xs font-bold text-slate-500 uppercase">الأصناف</span>
                            </div>

                            {items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <div className="col-span-5 space-y-1">
                                        <label className="text-xs text-slate-500">الصنف</label>
                                        <select
                                            value={item.productId}
                                            onChange={e => updateItem(index, 'productId', e.target.value)}
                                            className="w-full h-10 px-2 bg-white border border-slate-300 rounded outline-none"
                                            required
                                        >
                                            <option value="0">اختر الصنف</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                        <label className="text-xs text-slate-500">الكمية</label>
                                        <input
                                            type="number" value={item.quantity}
                                            onChange={e => updateItem(index, 'quantity', e.target.value)}
                                            className="w-full h-10 px-2 bg-white border border-slate-300 rounded outline-none text-center"
                                            min="1" required
                                        />
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                        <label className="text-xs text-slate-500">سعر الشراء</label>
                                        <input
                                            type="number" value={item.price}
                                            onChange={e => updateItem(index, 'price', e.target.value)}
                                            className="w-full h-10 px-2 bg-white border border-slate-300 rounded outline-none text-center"
                                            min="0" step="0.01" required
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button onClick={() => removeItem(index)} type="button" className="text-red-500 hover:text-red-700">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {items.length === 0 && (
                                <p className="text-center text-slate-400 py-4">لا توجد أصناف — اضغط على "إضافة صنف"</p>
                            )}

                            {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
                        </div>

                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">إجمالي الفاتورة</p>
                                <p className="text-xl font-bold text-primary">{totalAmount.toLocaleString()} ج.م</p>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg border border-slate-200 bg-white text-slate-600">
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || items.length === 0}
                                    className="px-8 py-2 rounded-lg bg-primary text-white font-bold disabled:opacity-50"
                                >
                                    {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
