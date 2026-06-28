import React, { useState, useEffect } from 'react';
import { getCustomers, getProducts, createOrder } from '../api';

interface CartItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    naulonPerTon: number;
}

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [naulonUncollected, setNaulonUncollected] = useState('0');

    const [qty, setQty] = useState('1');
    const [price, setPrice] = useState('');
    const [naulonPerTon, setNaulonPerTon] = useState('0');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            Promise.all([getCustomers(), getProducts()])
                .then(([c, p]) => { setCustomers(c); setProducts(p); })
                .catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const reset = () => {
        setSelectedCustomer(null); setSelectedProduct(null);
        setCart([]); setQty('1'); setPrice(''); setNaulonPerTon('0'); setNaulonUncollected('0'); setError('');
    };

    const handleClose = () => { reset(); onClose(); };

    const handleSelectProduct = (p: any) => {
        setSelectedProduct(p);
        setPrice(String(p.price));
        setQty('1');
    };

    const addToCart = () => {
        if (!selectedProduct) { setError('اختر منتجاً أولاً'); return; }
        const q = parseInt(qty);
        if (!q || q <= 0) { setError('أدخل كمية صحيحة'); return; }
        if (q > selectedProduct.stock) { setError(`المخزون المتاح: ${selectedProduct.stock} فقط`); return; }
        const unitPrice = parseFloat(price) || 0;
        if (!isDriverCustomer && unitPrice <= 0) { setError('أدخل سعراً صحيحاً'); return; }
        const ntPerTon = parseFloat(naulonPerTon) || 0;

        setCart(prev => {
            const existing = prev.find(i => i.productId === selectedProduct.id);
            return existing
                ? prev.map(i => i.productId === selectedProduct.id
                    ? { ...i, quantity: i.quantity + q, price: unitPrice, naulonPerTon: ntPerTon }
                    : i)
                : [...prev, { productId: selectedProduct.id, productName: selectedProduct.name, quantity: q, price: unitPrice, naulonPerTon: ntPerTon }];
        });

        setSelectedProduct(null);
        setQty('1');
        setPrice('');
        setNaulonPerTon('0');
        setError('');
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter(i => i.productId !== productId));
    };

    const totalProductsAmount = cart.reduce((s, i) => s + i.quantity * i.price, 0);
    const autoNaulon = cart.reduce((s, i) => s + i.quantity * i.naulonPerTon, 0);
    const naulos = parseFloat(naulonUncollected) || 0;
    const isDriverCustomer = selectedCustomer?.type === 'driver';
    const totalAmount = totalProductsAmount - autoNaulon;

    const handleSubmit = async () => {
        if (!selectedCustomer) { setError('اختر عميلاً'); return; }
        if (cart.length === 0) { setError('أضف منتجاً على الأقل'); return; }
        if (totalAmount < 0) { setError('ناولون/طن أكبر من إجمالي المنتجات'); return; }
        setLoading(true);
        setError('');
        try {
            await createOrder({
                customerId: selectedCustomer.id,
                totalAmount,
                naulonUncollected: isDriverCustomer ? (naulos || undefined) : undefined,
                items: cart.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    price: i.price,
                })),
            });
            onSuccess();
            handleClose();
        } catch (err: any) {
            setError(err.message || 'فشل إنشاء الطلب');
        } finally {
            setLoading(false);
        }
    };

    const availableProducts = products.filter(p => p.stock > 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm rtl">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700">
                            <span className="material-symbols-outlined">add_shopping_cart</span>
                        </div>
                        <div>
                            <h2 className="text-slate-900 font-bold text-lg">إنشاء طلب جديد</h2>
                            <p className="text-sm text-slate-500">اختر العميل والمنتجات</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">

                    {/* Row 1: Customer + Naulon */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Customer */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">العميل *</label>
                            <select
                                value={selectedCustomer?.id ?? ''}
                                onChange={e => setSelectedCustomer(customers.find(c => c.id === Number(e.target.value)) || null)}
                                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            >
                                <option value="">-- اختر عميلاً --</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}{c.type === 'driver' ? ' (سائق)' : ''} | المديونية: {Number(c.totalDebt).toLocaleString()} ج.م
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Naulon Uncollected — only for drivers */}
                        <div>
                            {isDriverCustomer ? (
                                <>
                                    <label className="block text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">ناولون لم يتم تحصيله (ج.م)</label>
                                    <input
                                        type="number"
                                        value={naulonUncollected}
                                        onChange={e => setNaulonUncollected(e.target.value)}
                                        min="0" step="0.01"
                                        className="w-full h-11 px-4 bg-amber-50 border border-amber-200 rounded-xl text-sm font-bold text-amber-700 focus:ring-2 focus:ring-amber-400 outline-none"
                                        placeholder="0.00"
                                    />
                                    {naulos > 0 && (
                                        <p className="text-xs text-amber-600 mt-1">يُحسب كرصيد للسائق (لا يُخصم من الطلب)</p>
                                    )}
                                </>
                            ) : (
                                <div className="h-full flex items-end pb-1">
                                    <p className="text-xs text-slate-400">ناولون لم يتم تحصيله متاح فقط للسائقين</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Selector */}
                    <div className="bg-blue-50/60 rounded-2xl p-5 border border-blue-100">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">إضافة منتج للسلة</label>
                        <div className="grid grid-cols-5 gap-3 mb-3">
                            <div className="col-span-2">
                                <label className="block text-[11px] font-bold text-slate-400 mb-1">المنتج</label>
                                <select
                                    value={selectedProduct?.id ?? ''}
                                    onChange={e => handleSelectProduct(availableProducts.find(p => p.id === Number(e.target.value)) || null)}
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="">-- اختر منتجاً --</option>
                                    {availableProducts.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} | السعر: {p.price} | المخزون: {p.stock}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 mb-1 text-center">الكمية (طن)</label>
                                <input
                                    type="number" value={qty} onChange={e => setQty(e.target.value)}
                                    min="1" step="1"
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary outline-none font-bold"
                                    placeholder="1"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 mb-1 text-center">سعر الوحدة (ج.م)</label>
                                <input
                                    type="number" value={price} onChange={e => setPrice(e.target.value)}
                                    min="0" step="0.01"
                                    className="w-full h-10 px-3 bg-white border border-primary rounded-lg text-sm text-center focus:ring-2 focus:ring-primary outline-none font-bold text-primary"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-amber-500 mb-1 text-center">ناولون/طن (ج.م)</label>
                                <input
                                    type="number" value={naulonPerTon} onChange={e => setNaulonPerTon(e.target.value)}
                                    min="0" step="0.01"
                                    className="w-full h-10 px-3 bg-amber-50 border border-amber-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-amber-400 outline-none font-bold text-amber-700"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {error && <p className="text-xs text-red-600 font-bold mb-2">{error}</p>}

                        <button
                            onClick={addToCart}
                            disabled={!selectedProduct}
                            className="w-full py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">add_circle</span>
                            إضافة للسلة
                        </button>
                    </div>

                    {/* Cart */}
                    {cart.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">السلة ({cart.length} صنف)</h3>
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <div key={item.productId} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                                            <button
                                                onClick={() => removeFromCart(item.productId)}
                                                className="w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-all text-xs font-bold"
                                            >
                                                ✕
                                            </button>
                                            <span className="font-bold text-slate-900">{item.productName}</span>
                                        </div>
                                        <div className="flex divide-x divide-x-reverse divide-slate-100">
                                            <div className="flex-1 px-3 py-3 text-center">
                                                <p className="text-[10px] text-slate-400 font-bold mb-1">الكمية</p>
                                                <p className="text-sm font-bold text-slate-800">{item.quantity} طن</p>
                                            </div>
                                            <div className="flex-1 px-3 py-3 text-center">
                                                <p className="text-[10px] text-slate-400 font-bold mb-1">السعر</p>
                                                <p className="text-sm font-bold text-slate-800">{item.price} ج.م</p>
                                            </div>
                                            {item.naulonPerTon > 0 && (
                                                <div className="flex-1 px-3 py-3 text-center bg-amber-50">
                                                    <p className="text-[10px] text-amber-600 font-bold mb-1">ناولون/طن</p>
                                                    <p className="text-sm font-bold text-amber-700">{item.naulonPerTon} ج.م</p>
                                                </div>
                                            )}
                                            <div className="flex-1 px-3 py-3 text-center bg-primary/5">
                                                <p className="text-[10px] text-primary font-bold mb-1">الإجمالي</p>
                                                <p className="text-sm font-black text-primary">
                                                    {(item.quantity * item.price).toLocaleString()} ج.م
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="mt-4 bg-slate-800 rounded-2xl p-5">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-slate-300 text-sm">إجمالي المنتجات</span>
                                    <span className="text-white font-bold">{totalProductsAmount.toLocaleString()} ج.م</span>
                                </div>
                                {autoNaulon > 0 && (
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-amber-300 text-sm">ناولون/طن</span>
                                        <span className="text-amber-300 font-bold">- {autoNaulon.toLocaleString()} ج.م</span>
                                    </div>
                                )}
                                <div className="border-t border-slate-600 pt-3 flex justify-between items-center">
                                    <span className="text-white font-bold text-base">صافي الطلب</span>
                                    <span className="text-white font-black text-xl">{totalAmount.toLocaleString()} ج.م</span>
                                </div>
                                {isDriverCustomer && naulos > 0 && (
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-600">
                                        <span className="text-green-400 text-sm">ناولون للسائق</span>
                                        <span className="text-green-400 font-bold">+ {naulos.toLocaleString()} ج.م</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex items-center justify-between">
                    <button onClick={handleClose} className="px-6 py-3 bg-white text-slate-500 rounded-xl font-bold border border-slate-200 hover:bg-slate-100 transition-all">
                        إلغاء
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || cart.length === 0 || !selectedCustomer}
                        className="px-10 py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-800 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
                    >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        {loading ? 'جاري الإنشاء...' : `تأكيد الطلب • ${totalAmount.toLocaleString()} ج.م`}
                    </button>
                </div>
            </div>
        </div>
    );
};
