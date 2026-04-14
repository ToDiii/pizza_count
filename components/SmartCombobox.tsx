"use client";

import { useState, useRef, useEffect } from "react";

interface SmartComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  onAddNew: (value: string) => Promise<void>;
  placeholder: string;
  label: string;
}

export function SmartCombobox({
  options,
  value,
  onChange,
  onAddNew,
  placeholder,
}: SmartComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localOptions, setLocalOptions] = useState(options);
  const [highlighted, setHighlighted] = useState(-1);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const trimmed = value.trim();
  const filtered = trimmed
    ? localOptions.filter((o) => o.toLowerCase().includes(trimmed.toLowerCase()) && o !== value)
    : localOptions;

  const showAddNew =
    trimmed.length > 0 &&
    !localOptions.some((o) => o.toLowerCase() === trimmed.toLowerCase());

  // items list: add-new entry first (if applicable), then filtered options
  const items: string[] = showAddNew
    ? [`__add__:${trimmed}`, ...filtered]
    : filtered;

  function openDropdown() {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setOpenUpward(window.innerHeight - rect.bottom < 200);
    }
    setIsOpen(true);
    setHighlighted(-1);
  }

  function closeDropdown() {
    setIsOpen(false);
    setHighlighted(-1);
  }

  async function handleAddNew(newValue: string) {
    if (!localOptions.includes(newValue)) {
      setLocalOptions((prev) => [newValue, ...prev]);
    }
    onChange(newValue);
    closeDropdown();
    await onAddNew(newValue);
  }

  function selectItem(item: string) {
    if (item.startsWith("__add__:")) {
      handleAddNew(item.slice(8));
    } else {
      onChange(item);
      closeDropdown();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") openDropdown();
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlighted((p) => Math.min(p + 1, items.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted((p) => Math.max(p - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlighted >= 0 && highlighted < items.length) {
          selectItem(items[highlighted]);
        } else if (showAddNew && trimmed) {
          handleAddNew(trimmed);
        }
        break;
      case "Escape":
        closeDropdown();
        break;
    }
  }

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (!isOpen) openDropdown();
        }}
        onFocus={openDropdown}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F7B731] bg-white"
        style={{ fontSize: "16px" }}
        autoComplete="off"
      />

      {isOpen && items.length > 0 && (
        <div
          className={`absolute left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto ${
            openUpward ? "bottom-full mb-1" : "top-full mt-1"
          }`}
          style={{ maxHeight: "180px" }}
        >
          {items.map((item, idx) => {
            const isAddNew = item.startsWith("__add__:");
            const display = isAddNew
              ? `+ "${item.slice(8)}" hinzufügen`
              : item;
            return (
              <button
                key={item}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectItem(item);
                }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors min-h-[44px] flex items-center ${
                  idx === highlighted
                    ? "bg-[#D62828] text-white"
                    : isAddNew
                    ? "text-[#D62828] font-medium hover:bg-red-50"
                    : "text-gray-800 hover:bg-gray-50"
                }`}
              >
                {display}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
