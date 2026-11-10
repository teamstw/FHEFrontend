"use client";

import { useState } from "react";

export function UserAvatar({
  src,
  name = "Test User",
  className = "",
}: {
  src?: string | null;
  name?: string;
  className?: string;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((part) => Array.from(part)[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "TU";
  return (
    <span
      className={`cepp-avatar ${className}`}
      role="img"
      aria-label={`${name} avatar`}
    >
      {src && failedSource !== src ? (
        <img src={src} alt="" onError={() => setFailedSource(src)} />
      ) : (
        initials
      )}
    </span>
  );
}
