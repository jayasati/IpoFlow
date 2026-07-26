import { useState, type KeyboardEvent } from "react";

interface EditableCellProps {
  value: string;
  onSave: (value: string) => void | Promise<void>;
  type?: "text" | "number";
  placeholder?: string;
}

export function EditableCell({ value, onSave, type = "text", placeholder }: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className="w-full rounded px-1 py-0.5 text-left hover:bg-slate-100"
      >
        {value ? value : <span className="text-slate-400">{placeholder ?? "—"}</span>}
      </button>
    );
  }

  const commit = async () => {
    if (draft === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      void commit();
    }
    if (event.key === "Escape") {
      setDraft(value);
      setEditing(false);
    }
  };

  return (
    <input
      autoFocus
      type={type}
      value={draft}
      disabled={saving}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => void commit()}
      onKeyDown={handleKeyDown}
      className="w-full rounded border border-slate-300 px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
    />
  );
}
