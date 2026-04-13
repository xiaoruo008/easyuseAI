"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

interface ResultImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  alt: string;
  label?: string;
  fallbackLabel?: string;
}

export default function ResultImage({
  alt,
  label,
  fallbackLabel = "图片加载中",
  className,
  ...props
}: ResultImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative bg-gray-100 ${className}`}>
      {/* Loading 占位 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-gray-300 border-t-amber-500 animate-spin" />
            <span className="text-[10px] text-gray-400">{fallbackLabel}</span>
          </div>
        </div>
      )}

      {/* Error 占位 */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-1 text-center px-2">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] text-gray-400">图片加载失败</span>
            {label && (
              <span className="text-[9px] text-gray-300 mt-0.5">{label}</span>
            )}
          </div>
        </div>
      )}

      {/* 实际图片 */}
      <Image
        {...props}
        alt={alt}
        className={`object-contain p-2 md:p-3 transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${hasError ? "opacity-0" : "opacity-100"}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />

      {/* Label 标签 */}
      {label && !hasError && !isLoading && (
        <span className="absolute top-2 right-2 text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full">
          {label}
        </span>
      )}
    </div>
  );
}
