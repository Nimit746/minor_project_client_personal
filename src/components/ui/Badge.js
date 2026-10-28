import React from "react";

export function Badge({
  children,
  variant = "default", // default | accent | success | danger | warning | info
  size = "sm", // sm | md
  className = "",
}) {
  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-xs font-semibold",
  };

  const variantClasses = {
    default: "bg-surface-off text-slate-700 border border-border-light",
    accent: "bg-accent/15 text-emerald-800 border border-accent/30 font-semibold",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    danger: "bg-red-50 text-danger border border-red-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    info: "bg-blue-50 text-info border border-blue-200",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${
        sizeClasses[size] || sizeClasses.sm
      } ${variantClasses[variant] || variantClasses.default} ${className}`}
    >
      {children}
    </span>
  );
}
