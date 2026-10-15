"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CharacterSummary } from "@/lib/characters";
import { tierInfo } from "@/lib/options";

const BUILD_STEPS = [
  "Searching the wikis",
  "Reading their page",
  "Collecting feats",
  "Checking weaknesses",
  "Working out power tiers",
  "Picking their colors",
  "Almost there",
];

type Props = {
  side: "a" | "b";
  label: string;
  value: CharacterSummary | null;
  version: string | null;
  onChange: (c: CharacterSummary | null, version: string | null) => void;
};

export function FighterField({ side, label, value, version, onChange }: Props) {
  const id = useId();
  const listId = `${id}-list`;
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CharacterSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [building, setBuilding] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) return;
    const term = q.trim();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/characters?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const data = await res.json();
        setResults(data.results ?? []);
        setActive(0);
      } catch {
        /* aborted or offline; keep the last results */
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, value]);

  useEffect(() => {
    if (!building) return;
    const t = setInterval(() => setStep((s) => Math.min(s + 1, BUILD_STEPS.length - 1)), 9000);
    return () => clearInterval(t);
  }, [building]);

  const term = q.trim();
  const exact = results.some((r) => r.name.toLowerCase() === term.toLowerCase());
  const canBuild = term.length >= 2 && !exact;
  const options = [...results.map((r) => ({ kind: "pick" as const, r })), ...(canBuild ? [{ kind: "build" as const, r: null }] : [])];

  function pick(c: CharacterSummary) {
    onChange(c, c.defaultVersionKey);
    setOpen(false);
    setQ("");
    setError(null);
  }

  async function build() {
    const name = term;
    setOpen(false);
    setError(null);
    setStep(0);
    setBuilding(name);
    try {
      const res = await fetch("/api/characters", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't build that profile.");
      pick(data.character);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't build that profile.");
    } finally {
      setBuilding(null);
    }
  }

  function choose(i: number) {
    const o = options[i];
    if (!o) return;
    if (o.kind === "pick") pick(o.r);
    else build();
  }

  if (value) {
    return (
      <div className={`fighter-field side-${side}`}>
        <span className="field-label">{label}</span>
        <div className="picked">
          <div className="picked-name">
            <strong>{value.name}</strong>
            <span>{value.franchise}</span>
          </div>
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              onChange(null, null);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
          >
            Change
          </button>
        </div>
        <label className="sr-only" htmlFor={`${id}-ver`}>
          {value.name} version
        </label>
        <select id={`${id}-ver`} className="version-select" value={version ?? value.defaultVersionKey} onChange={(e) => onChange(value, e.target.value)}>
          {value.versions.map((v) => (
            <option key={v.key} value={v.key}>
              {v.label} · {tierInfo(v.tier).name}
              {v.key === value.defaultVersionKey ? " (default)" : ""}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`fighter-field side-${side}`}>
      <label className="field-label" htmlFor={`${id}-in`}>
        {label}
      </label>
      <div className="combo">
        <input
          ref={inputRef}
          id={`${id}-in`}
          className="search-input"
          placeholder="Search any character"
          autoComplete="off"
          role="combobox"
          aria-expanded={open && options.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && options[active] ? `${listId}-${active}` : undefined}
          value={q}
          disabled={Boolean(building)}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (!open || !options.length) return;
            if (e.key === "ArrowDown") {
              setActive((a) => (a + 1) % options.length);
              e.preventDefault();
            } else if (e.key === "ArrowUp") {
              setActive((a) => (a - 1 + options.length) % options.length);
              e.preventDefault();
            } else if (e.key === "Enter") {
              choose(active);
              e.preventDefault();
            } else if (e.key === "Escape") setOpen(false);
          }}
        />
        {open && options.length > 0 && (
          <ul className="suggestions" id={listId} role="listbox">
            {options.map((o, i) => (
              <li
                key={o.kind === "pick" ? o.r.slug : "build"}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={o.kind === "build" ? "build-option" : undefined}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(i);
                }}
                onMouseEnter={() => setActive(i)}
              >
                {o.kind === "pick" ? (
                  <>
                    <span className="dot" style={{ background: o.r.look.top }} aria-hidden="true" />
                    <span className="s-name">{o.r.name}</span>
                    <span className="s-from">{o.r.franchise}</span>
                  </>
                ) : (
                  <>
                    <span className="dot plus" aria-hidden="true">+</span>
                    <span className="s-name">Add &ldquo;{term}&rdquo;</span>
                    <span className="s-from">We&rsquo;ll research them. Takes about a minute.</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {building && (
        <p className="build-status" role="status">
          <span className="spinner" aria-hidden="true" />
          Building {building}: {BUILD_STEPS[step]}…
        </p>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
