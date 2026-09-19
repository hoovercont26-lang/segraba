"use client";

import { parseDigits, type NumDraft } from "@/lib/money";
import { REDES, redesDe, type Red } from "@/lib/types";

export function NumberField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: NumDraft;
  onChange: (value: NumDraft) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm">{label}</span>
      <input
        className="field"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        value={value === "" ? "" : String(value)}
        onChange={(e) => onChange(parseDigits(e.target.value))}
      />
      {hint ? <span className="mt-1.5 block text-xs leading-5 text-muted">{hint}</span> : null}
    </label>
  );
}

export function RedesPicker({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: Red[];
  onChange: (value: Red[]) => void;
}) {
  function toggle(id: Red) {
    if (value.includes(id)) {
      if (value.length === 1) return;
      onChange(value.filter((item) => item !== id));
      return;
    }
    onChange([...value, id]);
  }

  return (
    <fieldset>
      <legend className="text-sm">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {REDES.map((red) => {
          const on = value.includes(red.id);
          return (
            <button
              key={red.id}
              type="button"
              aria-pressed={on}
              className={`net net-${red.id} ${on ? "net-on" : ""}`}
              onClick={() => toggle(red.id)}
            >
              {red.label}
            </button>
          );
        })}
      </div>
      {hint ? <p className="mt-2 text-xs leading-5 text-muted">{hint}</p> : null}
    </fieldset>
  );
}

export function RedChips({ redes }: { redes?: Red[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {redesDe({ redes }).map((id) => {
        const red = REDES.find((item) => item.id === id);
        return (
          <span key={id} className={`net net-${id}`}>
            {red?.label}
          </span>
        );
      })}
    </span>
  );
}
