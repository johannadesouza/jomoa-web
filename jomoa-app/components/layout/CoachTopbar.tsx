"use client";

import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { CoachSidebar } from "./CoachSidebar";

export function CoachTopbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState("Coach");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (data?.full_name) {
          setUserName(data.full_name.split(" ")[0]);
        }
      }
    };
    fetchUserName();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-[#FEFCF8] border-b border-[rgba(232,229,224,0.4)] shadow-sm">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost">
            <Menu className="h-6 w-6 text-[#5A6B5D]" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 max-w-sm">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="h-full overflow-auto">
            <CoachSidebar />
          </div>
        </SheetContent>
      </Sheet>
      <span className="text-xl font-the-seasons font-bold text-[#5A6B5D]">JOMOA Coach</span>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-[#5A6B5D] hidden sm:block">Hej, {userName}!</span>
        <Button variant="ghost" onClick={handleSignOut}>
          <User className="h-5 w-5 text-[#5A6B5D]" />
          <span className="sr-only">Profile / Logout</span>
        </Button>
      </div>
    </header>
  );
}


