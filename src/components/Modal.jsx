import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";

export default function Modal({ children, isOpen, modalTitle, onClose, maxWidth }) {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-[999]">
            {/* Overlay */}
            <DialogBackdrop transition className="fixed inset-0 bg-black/30 duration-300 ease-out data-closed:opacity-0" />

            {/* Modal Content */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel
                    transition
                    className={`bg-white w-full ${
                        maxWidth ? maxWidth : "max-w-2xl"
                    } rounded-2xl shadow-lg duration-300 ease-out data-closed:scale-95 data-closed:opacity-0`}
                >
                    {/* Modal Header */}
                    <div className="flex justify-between items-center border-b border-slate-200 p-4">
                        <DialogTitle className="text-xl font-bold">{modalTitle}</DialogTitle>
                        <button onClick={onClose} aria-label="Close Modal">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-4">{children}</div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
