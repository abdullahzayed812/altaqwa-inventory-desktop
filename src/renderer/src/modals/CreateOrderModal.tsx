import React, { useState, useEffect } from 'react';

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    const [customerId, setCustomerId] = useState('');
    const [items, setItems] = useState<any[]>([{ productId: '', quantity: 1, price: 0 }]);

    useEffect(() => {
        if (isOpen) {
            // @ts-ignore
            window.api.customers.getCustomers().then(setCustomers).catch(console.error);
            // @ts-ignore
            window.api.inventory.getProducts().then(setProducts).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddItem = () => {
        setItems([...items, { productId: '', quantity: 1, price: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const handleItemChange = (index: number, field: string, value: string | number) => {
        const newItems = [...items];
        newItems[index][field] = value;

        if (field === 'productId') {
            const product = products.find(p => p.id === Number(value));
            if (product) {
                newItems[index].price = product.price;
            }
        }

        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => {
            return sum + (Number(item.price) * Number(item.quantity));
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const totalAmount = calculateTotal();
            // @ts-ignore
            await window.api.orders.createOrder({
                customerId: Number(customerId),
                totalAmount,
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm rtl">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700">
                            <span className="material-symbols-outlined">add_shopping_cart</span>
                        </div>
                        <div>
                            <h2 className="text-headline-lg text-slate-900 font-bold">إنشاء طلب جديد</h2>
                            <p className="text-sm text-slate-500">قم بتعبئة تفاصيل الطلب لإتمامه</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all text-slate-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <form id="create-order-form" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div className="space-y-2">
                                <label className="text-label-md font-bold text-slate-700 block">اختر العميل</label>
                                <div className="relative">
                                    <select required value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-body-md focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                                        <option disabled value="">ابحث عن عميل موجود...</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-4">
                                <h3 className="text-headline-md text-slate-800 font-bold">بنود الطلب</h3>
                                <button type="button" onClick={handleAddItem} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 font-bold">
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    إضافة منتج
                                </button>
                            </div>

                            <div className="border border-slate-100 rounded-xl overflow-hidden">
                                <table className="w-full text-right border-collapse">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-sm text-slate-500">المنتج</th>
                                            <th className="px-4 py-3 text-sm text-slate-500 w-32">الكمية</th>
                                            <th className="px-4 py-3 text-sm text-slate-500 w-40">السعر</th>
                                            <th className="px-4 py-3 text-sm text-slate-500 w-40">الإجمالي الفرعي</th>
                                            <th className="px-4 py-3 text-sm text-slate-500 w-20 text-center">حذف</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => {
                                            const subtotal = Number(item.price) * Number(item.quantity);
                                            return (
                                                <tr key={index} className="border-t border-slate-100">
                                                    <td className="p-3">
                                                        <select required value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} className="w-full bg-transparent border border-slate-200 rounded p-2 text-sm focus:ring-0">
                                                            <option disabled value="">اختر المنتج</option>
                                                            {products.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-3">
                                                        <input required min="1" type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg py-1.5 px-3 text-center" />
                                                    </td>
                                                    <td className="p-3">
                                                        <input required min="0" step="0.01" type="number" value={item.price} onChange={e => handleItemChange(index, 'price', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg py-1.5 px-3 text-center font-bold" />
                                                    </td>
                                                    <td className="p-3 font-bold text-blue-800">{subtotal.toLocaleString()} ج.م</td>
                                                    <td className="p-3 text-center">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveItem(index)}
                                                            disabled={items.length === 1}
                                                            className="text-error hover:bg-error-container/20 p-2 rounded-lg transition-all disabled:opacity-30"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 w-1/2 space-y-4">
                                <div className="flex justify-between items-center text-blue-900">
                                    <span className="text-lg font-bold">الإجمالي النهائي</span>
                                    <span className="text-xl font-black">{calculateTotal().toLocaleString()} ج.م</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-4 bg-slate-50/30">
                    <button onClick={onClose} type="button" className="px-8 py-3 bg-white text-slate-500 rounded-xl font-bold border hover:bg-slate-100">
                        إلغاء
                    </button>
                    <button type="submit" form="create-order-form" className="px-10 py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        تأكيد وإنشاء الطلب
                    </button>
                </div>
            </div>
        </div>
    );
};
