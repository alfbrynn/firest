"use client";

import { Bell, ArrowLeft, CheckCircle2, AlertTriangle, Zap, LineChart, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { getNotificationsAction, markAllReadAction, deleteNotificationAction } from "@/src/app/actions/notificationActions";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useAppStore } from "@/src/store/useAppStore";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isDemo } = useAppStore();

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        if (isDemo) {
            setNotifications([
                {
                    id: "demo-1",
                    type: "system",
                    title: "Selamat datang di Firest! 🌳",
                    content: "Mulailah menabung untuk impian utamamu dan rawat hutanmu dengan menjaga keuanganmu agar tetap sehat.",
                    is_read: false,
                    created_at: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: "demo-2",
                    type: "insight",
                    title: "Pola Belanja Sehat 📈",
                    content: "Kerja bagus! Pengeluaran Makanan kamu masih di bawah batas anggaran minggu ini.",
                    is_read: true,
                    created_at: new Date(Date.now() - 24 * 3600000).toISOString()
                }
            ]);
            setIsLoading(false);
            return;
        }

        const result = await getNotificationsAction();
        if (result.success) {
            setNotifications(result.data || []);
        }
        setIsLoading(false);
    }, [isDemo]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAllRead = async () => {
        if (isDemo) {
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            return;
        }
        const result = await markAllReadAction();
        if (result.success) {
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        }
    };

    const handleDeleteNotif = async (id: string) => {
        if (isDemo) {
            setNotifications(notifications.filter(n => n.id !== id));
            return;
        }
        const result = await deleteNotificationAction(id);
        if (result.success) {
            setNotifications(notifications.filter(n => n.id !== id));
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'insight': return { icon: <LineChart className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-900/20' };
            case 'budget': return { icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-900/20' };
            case 'streak': return { icon: <Zap className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-50 dark:bg-orange-950/20' };
            default: return { icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-950/20' };
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-gray-950 text-foreground font-sans relative overflow-x-hidden">
            {/* Background Ornaments */}
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-100/25 dark:bg-blue-950/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 lg:px-16 xl:px-24 pt-6 pb-12 sm:pt-10">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
                        >
                            <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Notifikasi</h1>
                            <p className="text-xs font-medium text-muted-foreground mt-0.5">
                                {isLoading ? 'Memuat pesan...' : unreadCount > 0 ? `Kamu punya ${unreadCount} pesan baru` : 'Semua sudah dibaca'}
                            </p>
                        </div>
                    </div>

                    {!isLoading && unreadCount > 0 && (
                        <button 
                            onClick={handleMarkAllRead}
                            className="text-xs font-bold text-primary hover:text-emerald-700 transition-colors bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                        >
                            Tandai Baca Semua
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                            <p className="text-sm text-muted-foreground font-medium">Mengambil pesan terbaru...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map((notif) => {
                            const { icon, bg } = getIcon(notif.type);
                            return (
                                <div 
                                    key={notif.id}
                                    className={`group relative p-4 sm:p-5 rounded-[24px] border transition-all hover:shadow-md flex gap-4 items-start ${
                                        notif.is_read 
                                        ? 'bg-white/60 dark:bg-gray-900/40 border-gray-100 dark:border-gray-800 opacity-80' 
                                        : 'bg-white dark:bg-gray-900 border-emerald-100/50 dark:border-emerald-900/30 shadow-sm'
                                    }`}
                                >
                                    {!notif.is_read && (
                                        <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                    )}

                                    <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
                                        {icon}
                                    </div>

                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h3 className={`text-[15px] font-bold truncate ${notif.is_read ? 'text-foreground/70' : 'text-foreground'}`}>
                                                {notif.title}
                                            </h3>
                                            <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: localeId })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {notif.content}
                                        </p>
                                    </div>

                                    <button 
                                        onClick={() => handleDeleteNotif(notif.id)}
                                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all shrink-0"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <Bell className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-400">Belum ada notifikasi</h3>
                            <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
                                Kami akan memberitahu kamu jika ada info menarik seputar taman dan keuanganmu.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
