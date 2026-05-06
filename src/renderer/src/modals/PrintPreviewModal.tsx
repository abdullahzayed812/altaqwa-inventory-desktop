
import React from 'react';

interface PrintPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    html: string;
    onPrint: () => void;
    title?: string;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ isOpen, onClose, html, onPrint, title = 'معاينة الطباعة' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-primary">print</span>
                        </div>
                        <h3 className="font-headline-md font-bold text-slate-900">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-slate-200 p-8 overflow-auto flex justify-center">
                    <div className="bg-white shadow-lg w-[210mm] min-h-[297mm] origin-top scale-[0.85] sm:scale-100">
                        <iframe
                            title="Print Preview"
                            srcDoc={html}
                            className="w-full h-full border-none pointer-events-none"
                            style={{ minHeight: '297mm' }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                    >
                        إلغاء
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                const blob = new Blob([html], { type: 'text/html' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `document-${new Date().getTime()}.html`;
                                // a.click(); // This is just an alternative, Electron print is preferred
                            }}
                            className="px-6 py-2.5 rounded-xl border border-primary/20 text-primary font-bold hover:bg-primary/5 transition-all hidden"
                        >
                            حفظ كـ HTML
                        </button>
                        <button
                            onClick={onPrint}
                            className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-blue-800 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">print</span>
                            تأكيد الطباعة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
