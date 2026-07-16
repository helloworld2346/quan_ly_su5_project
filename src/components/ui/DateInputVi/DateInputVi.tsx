import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";

import styles from "./DateInputVi.module.css";

type Props = {
  value: string;
  onChange: (isoValue: string) => void;
  max?: string;
  min?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
};

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTH_LABELS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return "";
  const [y, m, d] = parts;
  return `${d}-${m}-${y}`;
}

function displayToIso(text: string): string {
  const parts = text.trim().split(/[-/.]/);
  if (parts.length !== 3) return "";
  const d = Number(parts[0]);
  const m = Number(parts[1]);
  const y = Number(parts[2]);
  if (!d || !m || !y || parts[2].length !== 4) return "";
  const dateObj = new Date(y, m - 1, d);
  if (
    dateObj.getFullYear() !== y ||
    dateObj.getMonth() !== m - 1 ||
    dateObj.getDate() !== d
  ) {
    return "";
  }
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function isoToDate(iso: string): Date | null {
  const parts = iso.split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function dateToIso(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate(),
  )}`;
}

function dayValue(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

export default function DateInputVi({
  value,
  onChange,
  max,
  min,
  disabled = false,
  className,
  id,
}: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(isoToDisplay(value));
  const [viewDate, setViewDate] = useState<Date>(
    isoToDate(value) ?? new Date(),
  );
  const [prevValue, setPrevValue] = useState(value);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  if (value !== prevValue) {
    setPrevValue(value);
    setText(isoToDisplay(value));
    const d = isoToDate(value);
    if (d) setViewDate(d);
  }
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const maxDate = useMemo(() => (max ? isoToDate(max) : null), [max]);
  const minDate = useMemo(() => (min ? isoToDate(min) : null), [min]);

  const selectedIso = value;

  const isDisabledDay = (date: Date): boolean => {
    if (maxDate && dayValue(date) > dayValue(maxDate)) return true;
    if (minDate && dayValue(date) < dayValue(minDate)) return true;
    return false;
  };

  const commitText = () => {
    const iso = displayToIso(text);
    if (iso) {
      const d = isoToDate(iso);
      if (d && isDisabledDay(d)) {
        setText(isoToDisplay(value));
        return;
      }
      onChange(iso);
    } else {
      setText(isoToDisplay(value));
    }
  };

  const handleSelectDay = (date: Date) => {
    if (isDisabledDay(date)) return;
    onChange(dateToIso(date));
    setOpen(false);
  };

  const cells = useMemo<(Date | null)[]>(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;
    const result: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i += 1) result.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      result.push(new Date(year, month, d));
    }
    return result;
  }, [viewDate]);

  const goMonth = (delta: number) => {
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
    );
  };

  return (
    <div ref={wrapRef} className={`${styles.wrap} ${className ?? ""}`}>
      <div className={styles.inputRow}>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          className={styles.input}
          placeholder="dd-mm-yyyy"
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commitText();
              setOpen(false);
            }
          }}
        />
        <button
          type="button"
          className={styles.calBtn}
          disabled={disabled}
          aria-label="Mở lịch"
          onClick={() => setOpen((v) => !v)}
        >
          <FontAwesomeIcon icon={faCalendarDays} />
        </button>
      </div>

      {open && (
        <div className={styles.popup} role="dialog">
          <div className={styles.header}>
            <button
              type="button"
              className={styles.navBtn}
              aria-label="Tháng trước"
              onClick={() => goMonth(-1)}
            >
              ‹
            </button>
            <span className={styles.headerLabel}>
              {MONTH_LABELS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              className={styles.navBtn}
              aria-label="Tháng sau"
              onClick={() => goMonth(1)}
            >
              ›
            </button>
          </div>

          <div className={styles.weekRow}>
            {WEEKDAY_LABELS.map((w) => (
              <span key={w} className={styles.weekCell}>
                {w}
              </span>
            ))}
          </div>

          <div className={styles.grid}>
            {cells.map((date, idx) => {
              if (!date) {
                return <span key={`empty-${idx}`} className={styles.dayCell} />;
              }
              const iso = dateToIso(date);
              const disabledDay = isDisabledDay(date);
              const selected = iso === selectedIso;
              return (
                <button
                  key={iso}
                  type="button"
                  className={`${styles.dayCell} ${styles.day} ${
                    selected ? styles.daySelected : ""
                  }`}
                  disabled={disabledDay}
                  onClick={() => handleSelectDay(date)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
