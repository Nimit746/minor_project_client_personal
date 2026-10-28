"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";

export function Topbar({ title, action }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-surface border-b border-border-light px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-ink tracking-tight">
          {title}
        </h1>
        <Badge variant="accent" size="sm">
          Calibrated
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        {action}
        <div className="h-8 w-px bg-border-light" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-xs font-bold text-emerald-800">
            {user?.full_name ? user.full_name[0].toUpperCase() : "U"}
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline-block">
            {user?.full_name || "Active Session"}
          </span>
        </div>
      </div>
    </header>
  );
}
