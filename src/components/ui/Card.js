import React from "react";

export function Card({ children, className = "", dark = false, ...props }) {
  return (
    <div
      className={`rounded-xl border transition-shadow ${
        dark
          ? "bg-ink border-border-dark text-white"
          : "bg-surface border-border-light text-ink shadow-xs"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
