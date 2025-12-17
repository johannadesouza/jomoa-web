"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  UtensilsCrossed, 
  BarChart3, 
  Settings,
  LogOut,
  Dumbbell,
  ClipboardCheck,
  Users2,
  Bell
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "/coach/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/coach/clients", label: "Klienter", icon: Users },
  { href: "/coach/programs", label: "Skapa program", icon: FileText },
  { href: "/coach/exercises", label: "Övningar", icon: Dumbbell },
  { href: "/coach/checkins", label: "Check-ins", icon: ClipboardCheck },
  { href: "/coach/groups", label: "Grupper", icon: Users2 },
  { href: "/coach/notifications", label: "Notiscenter", icon: Bell },
  { href: "/coach/insights", label: "Insikter", icon: BarChart3 },
  { href: "/coach/settings", label: "Inställningar", icon: Settings },
];

export function CoachSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { unreadCount } = useNotifications("coach");

  return (
    <aside className="hidden md:flex w-64 bg-[#FEFCF8] border-r border-[rgba(232,229,224,0.4)] flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-[rgba(232,229,224,0.4)]">
        <h2 className="text-2xl font-the-seasons font-bold text-[#5A6B5D]">JOMOA</h2>
        <p className="text-xs text-[#5A6B5D]/70 mt-1">Coach</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-[20px] text-sm font-medium transition-all relative ${
                isActive
                  ? "bg-[#5A6B5D]/10 text-[#5A6B5D] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                  : "text-[#5A6B5D]/70 hover:bg-[#FEFCF8]/80 hover:text-[#5A6B5D]"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
              {item.href === "/coach/notifications" && unreadCount > 0 && (
                <span className="ml-auto bg-[#8B6F47] text-[#FEFCF8] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-[rgba(232,229,224,0.4)]">
        <button
          onClick={async () => {
            await signOut();
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-[20px] text-sm font-medium text-[#5A6B5D]/70 hover:bg-[#FEFCF8]/80 hover:text-[#5A6B5D] transition-all"
        >
          <LogOut className="h-5 w-5" />
          Logga ut
        </button>
      </div>
    </aside>
  );
}


