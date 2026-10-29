"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { useMobileNav } from "./AppShell";

export function Topbar({ title, action }) {
  const { user } = useAuth();
  const { open } = useMobileNav();

  return (
    <header className="h-16 bg-surface border-b border-border-light px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile navigation trigger */}
        <button
          onClick={open}
          className="md:hidden p-2 -ml-2 text-slate-700 hover:bg-surface-off rounded-lg transition-colors shrink-0"
          aria-label="Open navigation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 className="text-base sm:text-xl font-bold text-ink tracking-tight truncate">
          {title}
        </h1>
        <Badge variant="accent" size="sm" className="hidden sm:inline-flex shrink-0">
          Calibrated
        </Badge>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {action}
        <div className="h-8 w-px bg-border-light hidden sm:block" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-xs font-bold text-emerald-800">
            {user?.full_name ? user.full_name[0].toUpperCase() : "U"}
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden lg:inline-block">
            {user?.full_name || "Active Session"}
          </span>
        </div>
      </div>
    </header>
  );
}
