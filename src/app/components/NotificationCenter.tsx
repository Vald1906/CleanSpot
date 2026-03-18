"use client";

import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, markNotificationAsRead } from '@/app/actions/notificationActions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function NotificationCenter() {
    const { data: session } = useSession();
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        if (session?.user?.id) {
            loadNotifications();
            // Poll every 30 seconds for new notifications
            const interval = setInterval(loadNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [session]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        if (!session?.user?.id) return;
        const res = await getNotifications(Number(session.user.id));
        if (res.success) {
            setNotifications(res.data);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        const res = await markNotificationAsRead(id);
        if (res.success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: 1 } : n));
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10"
            >
                <span className="material-icons-outlined text-white">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#1a2f28]">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-[#1a2f28] rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <h3 className="font-bold text-white">Notifications</h3>
                        <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">
                            {unreadCount} Non lues
                        </span>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-white/30">
                                <span className="material-icons-outlined text-3xl mb-2 opacity-20">notifications_off</span>
                                <p className="text-sm">Aucune notification</p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const isReply = n.title.startsWith('Réponse du support');
                                return (
                                <div 
                                    key={n.id} 
                                    onClick={() => {
                                        handleMarkAsRead(n.id);
                                        if (isReply) {
                                            setIsOpen(false);
                                            // Extract subject without "Réponse du support : "
                                            const originalSubject = n.title.replace('Réponse du support :', '').trim();
                                            router.push(`/contact?replyTo=${encodeURIComponent(originalSubject)}`);
                                        }
                                    }}
                                    className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer relative ${!n.isRead ? 'bg-emerald-400/5' : ''}`}
                                >
                                    {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400" />}
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm font-bold ${!n.isRead ? 'text-white' : 'text-white/80'}`}>{n.title}</h4>
                                        <span className="text-[9px] text-white/40">{new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                    </div>
                                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{n.message}</p>
                                    {n.type === 'Suggestion' && (
                                        <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded-md uppercase tracking-wider">
                                            Suggestion
                                        </span>
                                    )}
                                    {isReply && (
                                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-1.5 rounded-lg w-fit transition-colors">
                                            <span className="material-icons-outlined text-[12px]">reply</span>
                                            Cliquez ici pour répondre
                                        </div>
                                    )}
                                </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
