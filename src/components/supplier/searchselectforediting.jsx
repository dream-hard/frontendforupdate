import React, { useEffect, useRef, useState } from "react";

/**
 * SearchableSelect
 * props:
 * - options: [{ uuid, currency_iso, name, symbol }, ...]
 * - value: currently selected value (matches valueField)
 * - onChange: (newValue) => void  // called ONLY when user selects an option
 * - placeholder: string
 * - valueField: "currency_iso" | "uuid"  (what onChange returns and what value compares to)
 * - displayField: "currency_iso" | "name" (what shows in list main column)
 * - debounceMs: number (search debounce)
 * - maxHeight: string (css height)
 */
export default function SearchableSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Search...",
  valueField = "currency_iso",
  displayField = "currency_iso",
  debounceMs = 100,
  maxHeight = "240px",
}) {
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(options || []);
  const [highlight, setHighlight] = useState(0);
  const [internalSelected, setInternalSelected] = useState(null);

  // sync selected -> show display in input
  useEffect(() => {
    const sel = options.find((o) => String(o[valueField]) === String(value));
    setInternalSelected(sel || null);
    setQuery(sel ? (sel[displayField] || sel[valueField] || "") : "");
  }, [value, options, valueField, displayField]);

  // debounce filter
  useEffect(() => {
    const q = query.trim().toLowerCase();
    const handler = setTimeout(() => {
      if (!q) {
        setFiltered(options);
      } else {
        setFiltered(
          options.filter(
            (o) =>
              String(o[displayField] || "").toLowerCase().includes(q) ||
              String(o.name || "").toLowerCase().includes(q) ||
              String(o.currency_iso || "").toLowerCase().includes(q)
          )
        );
      }
      setHighlight(0);
    }, debounceMs);
    return () => clearTimeout(handler);
  }, [query, options, debounceMs, displayField]);

  // click outside to close
  useEffect(() => {
    function onDoc(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // keyboard navigation
  const onKeyDown = (e) => {
    if (!open && ["ArrowDown", "ArrowUp"].includes(e.key)) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && filtered[highlight]) selectOption(filtered[highlight]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      // restore input to selected value
      setQuery(internalSelected ? (internalSelected[displayField] || "") : "");
    }
  };

  const selectOption = (opt) => {
    setInternalSelected(opt);
    setQuery(opt[displayField] || opt[valueField] || "");
    setOpen(false);
    onChange && onChange(opt[valueField]);
  };

  const clearSelection = () => {
    setInternalSelected(null);
    setQuery("");
    setOpen(false);
    onChange && onChange(""); // notify parent cleared
    inputRef.current?.focus();
  };

  // highlighting matched substring
  const highlightText = (text = "") => {
    const q = query.trim();
    if (!q) return text;
    const idx = String(text).toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.substring(0, idx)}
        <strong>{text.substring(idx, idx + q.length)}</strong>
        {text.substring(idx + q.length)}
      </>
    );
  };

  return (
    <div ref={wrapperRef} className="position-relative" style={{ minWidth: 240 }}>
      <div className="input-group">
        <input
          ref={inputRef}
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          aria-expanded={open}
          aria-haspopup="listbox"
          role="combobox"
          autoComplete="off"
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          title="Clear"
          onClick={clearSelection}
          aria-label="Clear selection"
        >
          ✕
        </button>
      </div>

      {open && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="list-group position-absolute w-100 shadow-sm"
          style={{ zIndex: 2000, maxHeight: maxHeight, overflowY: "auto" }}
        >
          {filtered.length === 0 ? (
            <li className="list-group-item text-muted">لا توجد نتائج</li>
          ) : (
            filtered.map((opt, idx) => {
              const isActive = idx === highlight;
              return (
                <li
                  key={opt[valueField] || idx}
                  role="option"
                  aria-selected={isActive}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${isActive ? "active" : ""}`}
                  onMouseEnter={() => setHighlight(idx)}
                  onMouseDown={(e) => {
                    // use mouseDown to avoid blur before click
                    e.preventDefault();
                    selectOption(opt);
                  }}
                >
                  <div>
                    <div>{highlightText(opt[displayField] || opt.currency_iso || "")}</div>
                    {opt.name && <small className="text-muted d-block">{opt.name}</small>}
                  </div>
                  {opt.symbol && <span className="badge bg-light text-dark">{opt.symbol}</span>}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
