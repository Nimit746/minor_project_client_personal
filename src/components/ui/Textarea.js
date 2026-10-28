import React from "react";

export function Textarea({
  label,
  error,
  helperText,
  id,
  rows = 5,
  maxLength,
  value = "",
  className = "",
  disabled = false,
  ...props
}) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            {label}
          </label>
        )}
        {maxLength && (
          <span className="text-xs text-slate-500">
            {currentLength} / {maxLength}
          </span>
        )}
      </div>
      <textarea
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 bg-surface text-ink text-sm rounded-md border transition-colors outline-none resize-y placeholder:text-slate-500
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
