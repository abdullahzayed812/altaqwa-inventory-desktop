import React, { useState, useEffect } from 'react';

interface CreatePurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialSupplierId?: number;
}

export const CreatePurchaseModal: React.FC<CreatePurchaseModalProps> = ({ isOpen, onClose, onSuccess, initialSupplierId }) => {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [supplierId, setSupplierId] = useState<number | ''>(initialSupplierId || '');
    const [items, setItems] = useState<{ productId: number, quantity: number, price: number }[]>([]);

    useEffect(() => {
        if (isOpen) {
            loadData();
            if (initialSupplierId) setSupplierId(initialSupplierId);
        }
    }, [isOpen, initialSupplierId]);

    const loadData = async () => {
        try {
            // @ts-ignore
            const s = await window.api.suppliers.getSuppliers();
            // @ts-ignore
            const p = await window.api.inventory.getProducts();
            setSuppliers(s);
            setProducts(p);
        } catch (error) {
            console.error(error);
        }
    };

    const addItem = () => {
        setItems([...items, { productId: 0, quantity: 1, price: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        // Auto-fill price if product is selected
        if (field === 'productId') {
            const product = products.find(p => p.id === Number(value));
            if (product) {
                newItems[index].price = product.price;
            }
        }
        
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplierId || items.length === 0) return;
        
        try {
            // @ts-ignore
            await window.api.suppliers.createPurchase({
                supplierId: Number(supplierId),
                items: items.map(item => ({
                    productId: Number(item.productId),
                    quantity: Number(item.quantity),
                    price: Number(item.price)
                }))
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    if (!isOpen) return null;

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rtl">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg">إنشاء فاتورة شراء (إضافة مخزون)</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-primary">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-2">
                        <label className="block font-bold">المورد</label>
                        <select 
                            value={supplierId} 
                            onChange={e => setSupplierId(Number(e.target.value))}
                            className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                            required
                        >
                            <option value="">اختر المورد</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="font-bold">الأصناف</label>
                            <button onClick={addItem} type="button" className="text-primary flex items-center gap-1 text-sm font-bold">
                                <span className="material-symbols-outlined text-sm">add</span>
                                إضافة صنف
                            </button>
                        </div>

                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <div className="col-span-5 space-y-1">
                                    <label className="text-xs text-slate-500">الصنف</label>
                                    <select 
                                        value={item.productId} 
                                        onChange={e => updateItem(index, 'productId', e.target.value)}
                                        className="w-full h-10 px-2 bg-white border border-slate-300 rounded outline-none"
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
                                        type="number" 
                                        value={item.quantity} 
                                        onChange={e => updateItem(index, 'quantity', e.target.value)}
                                        className="w-full h-10 px-2 bg-white border border-slate-300 rounded outline-none text-center"
                                    />
                                </div>
                                <div className="col-span-3 space-y-1">
                                    <label className="text-xs text-slate-500">سعر الشراء</label>
                                    <input 
                                        type="number" 
                                        value={item.price} 
                                        onChange={e => updateItem(index, 'price', e.target.value)}
                                        className="w-full h-10 px-2 bg-white border border-slate-300 rounded outline-none text-center"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <button onClick={() => removeItem(index)} className="text-red-500 mb-2">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">إجمالي الفاتورة</p>
                        <p className="text-xl font-bold text-primary">{totalAmount.toLocaleString()} ج.م</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-2 rounded-lg border border-slate-200 bg-white">إلغاء</button>
                        <button onClick={handleSubmit} className="px-8 py-2 rounded-lg bg-primary text-white font-bold">حفظ الفاتورة</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
