import React from "react";

export function Button({
  children,
  variant = "primary", // primary | secondary | outline | danger | ghost
  size = "md", // sm | md | lg
  type = "button",
  disabled = false,
  loading = false,
  className = "",
  onClick,
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-md";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base font-semibold",
  };

  const variantClasses = {
    primary:
      "bg-accent hover:bg-accent-hover text-ink focus:ring-accent font-semibold shadow-sm",
    secondary:
      "bg-surface hover:bg-surface-off text-ink border border-border-light focus:ring-slate-500 shadow-sm",
    outline:
      "border border-border-light hover:bg-surface-off text-ink focus:ring-accent",
    danger:
      "bg-danger hover:opacity-90 text-white focus:ring-danger shadow-sm",
    ghost:
      "hover:bg-surface-off text-slate-700 hover:text-ink focus:ring-accent",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
