import React, { useState } from 'react';

interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // @ts-ignore
            await window.api.customers.addCustomer({
                name,
                phone,
                address
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rtl">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
                        </div>
                        <div>
                            <h3 className="font-headline-md text-on-surface text-lg font-bold">إضافة عميل جديد</h3>
                            <p className="text-sm text-slate-500">قم بإدخال بيانات العميل لإنشاء ملف تعريفي جديد</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-primary transition-colors p-1">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="px-8 py-8 space-y-6">
                    <form id="add-customer-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="font-label-md text-on-surface block" htmlFor="customer_name">الاسم بالكامل <span className="text-red-500">*</span></label>
                            <div className="relative group">
                                <input value={name} onChange={e => setName(e.target.value)} required className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md transition-all outline-none" id="customer_name" placeholder="أدخل اسم العميل أو اسم المؤسسة" type="text" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="font-label-md text-on-surface block" htmlFor="customer_phone">رقم الهاتف <span className="text-red-500">*</span></label>
                            <div className="relative group">
                                <input value={phone} onChange={e => setPhone(e.target.value)} required className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md transition-all outline-none text-right" dir="ltr" id="customer_phone" placeholder="مثال: 01012345678" type="tel" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="font-label-md text-on-surface block" htmlFor="customer_address">العنوان</label>
                            <div className="relative group">
                                <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md transition-all outline-none resize-none" id="customer_address" placeholder="المحافظة، المدينة، اسم الشارع، علامة مميزة" rows={3}></textarea>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-lg font-label-md text-slate-600 border border-slate-200 bg-white hover:bg-slate-100 transition-all">
                        إلغاء
                    </button>
                    <button type="submit" form="add-customer-form" className="px-8 py-2.5 rounded-lg font-label-md bg-primary text-white shadow-lg hover:bg-blue-800 transition-all flex items-center gap-2">
                        حفظ البيانات
                        <span className="material-symbols-outlined text-[18px]">save</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
