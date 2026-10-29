"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "./Sidebar";
import { ROUTES } from "@/configs/routes";

const MobileNavContext = createContext({
  isOpen: false,
  open: () => { },
  close: () => { },
});

export function useMobileNav() {
  return useContext(MobileNavContext);
}

export function AppShell({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-off">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Loading Nexora...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <MobileNavContext.Provider
      value={{
        isOpen: isMobileNavOpen,
        open: () => setIsMobileNavOpen(true),
        close: () => setIsMobileNavOpen(false),
      }}
    >
      <div className="min-h-screen flex bg-surface-off text-ink">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </div>
      </div>
    </MobileNavContext.Provider>
  );
}
