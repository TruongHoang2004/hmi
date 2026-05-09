"use client";
import { useState } from "react";

/** I/O Field - Direct read/write field mimicking TIA Portal Input/Output mode */
export default function IOField({ tag, value, onWrite, wide }: {
  tag: string;
  value: number;
  onWrite: (tag: string, val: number) => void;
  wide?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState("");
  const display = editing ? local : String(value ?? 0).padStart(2, "0");

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      className={`io-field ${wide ? "io-field-wide" : ""}`}
      onFocus={() => { setEditing(true); setLocal(String(value ?? 0)); }}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        setEditing(false);
        const n = parseInt(local);
        if (!isNaN(n)) onWrite(tag, n);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setEditing(false);
      }}
    />
  );
}
