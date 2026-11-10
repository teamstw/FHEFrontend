"use client";

import type { GroupSelection } from "@/types/workspace";
import { useEffect, useId, useRef, useState } from "react";

export function GroupMultiSelect({
  options,
  value,
  onChange,
  disabled = false,
  loading = false,
}: {
  options: GroupSelection[];
  value: GroupSelection[];
  onChange: (groups: GroupSelection[]) => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const requestedFocus = useRef<"first" | "last" | null>(null);
  const selected = options.filter((group) =>
    value.some((item) => item.id === group.id),
  );

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    const inputs = root.current?.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    if (inputs?.length && requestedFocus.current) {
      inputs[requestedFocus.current === "last" ? inputs.length - 1 : 0].focus();
      requestedFocus.current = null;
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div
      className="cepp-group-select cepp-field"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
    >
      <span id={`${id}-label`}>Group</span>
      <button
        ref={trigger}
        type="button"
        className="cepp-group-select-trigger"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-expanded={open}
        aria-controls={`${id}-options`}
        disabled={disabled || !options.length}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            requestedFocus.current =
              event.key === "ArrowDown" ? "first" : "last";
            setOpen(true);
          }
        }}
      >
        <span id={`${id}-value`}>
          {loading
            ? "Loading groups…"
            : selected.length
              ? selected.map((group) => group.name).join(", ")
              : "Choose a group"}
        </span>
        <img src="/figma/d5aaa.svg" width={16} height={16} alt="" />
      </button>
      {open && !disabled && (
        <div
          id={`${id}-options`}
          className="cepp-group-select-options"
          role="group"
          aria-label="Available groups"
          onKeyDown={(event) => {
            if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key))
              return;
            event.preventDefault();
            const inputs = Array.from(
              event.currentTarget.querySelectorAll<HTMLInputElement>(
                'input[type="checkbox"]',
              ),
            );
            const index = inputs.indexOf(
              document.activeElement as HTMLInputElement,
            );
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? inputs.length - 1
                  : (index +
                      (event.key === "ArrowDown" ? 1 : -1) +
                      inputs.length) %
                    inputs.length;
            inputs[next]?.focus();
          }}
        >
          {options.map((group, index) => {
            const checked = selected.some((item) => item.id === group.id);
            return (
              <label key={group.id} className="cepp-group-select-option">
                <img
                  src="/figma/fdc44.svg"
                  width={16.1667}
                  height={12.8333}
                  alt=""
                />
                <span className="cepp-group-select-name">{group.name}</span>
                <span className="cepp-group-checkbox">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      const ids = new Set(selected.map((item) => item.id));
                      if (event.target.checked) ids.add(group.id);
                      else ids.delete(group.id);
                      onChange(options.filter((item) => ids.has(item.id)));
                    }}
                  />
                  <span
                    className={
                      "cepp-group-checkbox-mark" + (checked ? " checked" : "")
                    }
                    aria-hidden="true"
                  >
                    <img
                      src={
                        checked
                          ? "/figma/adb42.svg"
                          : `/figma/${checkboxAssets[index % checkboxAssets.length]}`
                      }
                      width={30}
                      height={30}
                      alt=""
                    />
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

const checkboxAssets = ["2d7fb.svg", "09b4e.svg", "ababd.svg"];
