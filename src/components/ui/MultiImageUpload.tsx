'use client';

import React, { useState, useRef } from 'react';

interface MultiImageUploadProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  label?: string;
}

export function MultiImageUpload({
  urls = [],
  onChange,
  maxImages = 10,
  label = 'Add Images',
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (urls.length + files.length > maxImages) {
      setUploadError(`You can upload at most ${maxImages} images.`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to upload one of the images');
        }
        if (data.url) {
          uploadedUrls.push(data.url);
        }
      }

      onChange([...urls, ...uploadedUrls]);
    } catch (err: any) {
      setUploadError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(urls.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      {/* Uploaded image previews */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {urls.map((url, index) => (
          <div
            key={url + index}
            className="group relative aspect-video sm:aspect-square rounded-lg overflow-hidden border border-card-border bg-black/60 shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Number badge */}
            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-[11px] font-semibold text-purple-300 border border-purple-500/30 backdrop-blur-sm">
              #{index + 1}
            </span>
            {/* Remove button */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              title="Remove image"
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center text-xs opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 shadow-lg cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Add more tile */}
        {urls.length < maxImages && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative aspect-video sm:aspect-square rounded-lg border-2 border-dashed border-card-border hover:border-purple-500 cursor-pointer overflow-hidden bg-black/40 hover:bg-purple-950/10 transition-all flex flex-col items-center justify-center p-3 text-center group"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] text-purple-300">Uploading...</span>
              </div>
            ) : (
              <>
                <svg
                  className="w-7 h-7 mb-1 text-gray-500 group-hover:text-purple-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
                  {label}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5">
                  ({urls.length}/{maxImages})
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFilesChange}
        className="hidden"
      />

      {uploadError && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-md">
          {uploadError}
        </p>
      )}
    </div>
  );
}
