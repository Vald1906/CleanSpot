"use client";

import React from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
    const bgColor = type === 'success' ? 'bg-[#33a17b]' : type === 'error' ? 'bg-rose-500' : 'bg-[#1a2f28]';
    const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';

    return (
        <div className={`${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-10 duration-300 pointer-events-auto min-w-[300px]`}>
            <span className="material-icons-outlined text-white">{icon}</span>
            <span className="text-sm font-bold flex-1">{message}</span>
            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <span className="material-icons-outlined text-xs">close</span>
            </button>
        </div>
    );
};

export default Toast;
