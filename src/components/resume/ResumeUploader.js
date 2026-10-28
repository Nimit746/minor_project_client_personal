"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { APP_CONFIG } from "@/configs/constants";

export function ResumeUploader({ onUpload, isUploading }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState("");
  const fileInputRef = useRef(null);

  const validateAndHandle = (file) => {
    setValidationError("");
    if (!file) return;

    const isAllowedMime = APP_CONFIG.RESUME.ALLOWED_MIME_TYPES.includes(file.type);
    const hasAllowedExt = APP_CONFIG.RESUME.ALLOWED_EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!isAllowedMime && !hasAllowedExt) {
      setValidationError("Invalid file type. Only PDF and DOCX documents are supported.");
      return;
    }

    if (file.size > APP_CONFIG.RESUME.MAX_SIZE_BYTES) {
      setValidationError("File is too large. Maximum size allowed is 10 MB.");
      return;
    }

    onUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndHandle(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndHandle(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
          isDragOver
            ? "border-accent bg-accent/5 scale-[1.01]"
            : "border-border-light hover:border-slate-500 bg-surface"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        <div className="w-12 h-12 rounded-full bg-surface-off border border-border-light flex items-center justify-center text-slate-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">
            {isUploading ? "Uploading & extracting resume..." : "Click to upload or drag & drop"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            PDF or DOCX (up to 10 MB)
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          disabled={isUploading}
          loading={isUploading}
          className="pointer-events-none mt-1"
        >
          {isUploading ? "Processing..." : "Select File"}
        </Button>
      </div>

      {validationError && (
        <p className="text-xs text-danger font-medium mt-2 text-center">
          {validationError}
        </p>
      )}
    </div>
  );
}
