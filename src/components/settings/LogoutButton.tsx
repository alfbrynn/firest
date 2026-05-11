import { LogOut } from "lucide-react";

interface LogoutButtonProps {
    isLoggingOut: boolean;
    onLogout: () => void;
}

export default function LogoutButton({ isLoggingOut, onLogout }: LogoutButtonProps) {
    return (
        <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="w-full bg-white hover:bg-red-50 text-red-500 hover:text-red-600 border-2 border-red-50 hover:border-red-100 py-4 rounded-[20px] font-bold text-base flex items-center justify-center gap-3 shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
        >
            {isLoggingOut ? (
                <span className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
            ) : (
                <LogOut className="w-5 h-5 stroke-[2.5px]" />
            )}
            {isLoggingOut ? "Mengeluarkan..." : "Keluar dari Akun"}
        </button>
    );
}