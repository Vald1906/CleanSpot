"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast from '@/app/components/Toast';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((message: string, type: NotificationType = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications((prev) => [...prev, { id, message, type }]);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 3000);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {notifications.map((notification) => (
                    <Toast
                        key={notification.id}
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
