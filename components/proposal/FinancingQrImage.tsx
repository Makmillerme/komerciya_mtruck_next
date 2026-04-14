"use client";

import { useState } from "react";

/**
 * QR у КП: динамічний src (data URL або /api/qr) з резервом на статичний webp при помилці завантаження.
 * Батько може передати `key={src ?? "static"}`, щоб скидати стан при зміні посилання.
 */
export function FinancingQrImage({
  src,
  fallbackSrc,
  alt,
  className,
}: {
  src: string | null | undefined;
  fallbackSrc: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const useDynamic = Boolean(src?.trim()) && !failed;
  const effectiveSrc = useDynamic ? src! : fallbackSrc;

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
