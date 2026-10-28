import React from "react";

export function Input({
  label,
  error,
  helperText,
  id,
  type = "text",
  className = "",
  disabled = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 bg-surface text-ink text-sm rounded-md border transition-colors outline-none placeholder:text-slate-500
          ${
            error
              ? "border-danger focus:ring-1 focus:ring-danger"
              : "border-border-light focus:border-accent focus:ring-1 focus:ring-accent"
          }
          ${disabled ? "bg-surface-off cursor-not-allowed opacity-60" : ""}
          ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-danger font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
