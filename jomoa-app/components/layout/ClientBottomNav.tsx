"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { LayoutDashboard, Dumbbell, UtensilsCrossed, BarChart3, Settings, LogOut, Calendar, Bell } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/workouts", label: "Träning", icon: Dumbbell },
  { href: "/client/calendar", label: "Kalender", icon: Calendar },
  { href: "/client/nutrition", label: "Kost", icon: UtensilsCrossed },
  { href: "/client/insights", label: "Insikter", icon: BarChart3 },
  { href: "/client/notifications", label: "Notiser", icon: Bell },
  { href: "/client/settings", label: "Inställningar", icon: Settings },
];

export function ClientBottomNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();
  const { unreadCount } = useNotifications("client");

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#FEFCF8] border-t border-[rgba(232,229,224,0.4)] z-50 md:relative md:border-t-0 md:border-l md:flex md:flex-col md:w-64 md:h-screen md:sticky md:top-0">
      <div className="flex items-center justify-around h-16 px-2 md:flex-col md:items-stretch md:justify-start md:h-auto md:px-4 md:py-4 md:space-y-2">
        <div className="hidden md:block p-4 border-b border-[rgba(232,229,224,0.4)] mb-4">
          <h2 className="text-2xl font-the-seasons font-bold text-[#5A6B5D]">JOMOA</h2>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 flex-1 md:flex-none h-full md:h-auto md:px-4 md:py-3 rounded-[20px] transition-all relative ${
                isActive
                  ? "text-[#8B6F47] md:bg-[#5A6B5D]/10 md:text-[#5A6B5D]"
                  : "text-[#5A6B5D]/70 md:hover:bg-[#FEFCF8]/80 md:hover:text-[#5A6B5D]"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.href === "/client/notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#8B6F47] text-[#FEFCF8] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs md:text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Logout button - only on desktop sidebar */}
      <div className="hidden md:block p-4 border-t border-[rgba(232,229,224,0.4)] mt-auto">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-[20px] text-sm font-medium text-[#5A6B5D]/70 hover:bg-[#FEFCF8]/80 hover:text-[#5A6B5D] transition-all"
        >
          <LogOut className="h-5 w-5" />
          Logga ut
        </button>
      </div>
    </nav>
  );
}


