"use client";
import type { ButtonHTMLAttributes } from "react";
export function Button({
  children,
  secondary = false,
  danger = false,
  small = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  secondary?: boolean;
  danger?: boolean;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      className={`cepp-button ${secondary ? "secondary" : ""} ${danger ? "danger" : ""} ${small ? "small" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
