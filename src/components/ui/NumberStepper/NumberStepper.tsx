import { useState } from "react";

import styles from "./NumberStepper.module.css";

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  required?: boolean;
};

export default function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  required = false,
}: Props) {
  const [text, setText] = useState(String(value));
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setText(String(value));
  }

  const commit = (v: number) => {
    const clamped = Math.max(min, v);
    setText(String(clamped));
    onChange(clamped);
  };

  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>{label}</span>
      <div className={styles.numberInput}>
        <button
          type="button"
          className={`${styles.numberInputBtn} ${styles.numberInputBtnLeft}`}
          onClick={() => commit(value - 1)}
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={text}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            setText(raw);
            onChange(raw === "" ? min : Math.max(min, parseInt(raw, 10)));
          }}
          onBlur={() => {
            if (text === "") setText(String(min));
          }}
          required={required}
        />
        <button
          type="button"
          className={`${styles.numberInputBtn} ${styles.numberInputBtnRight}`}
          onClick={() => commit(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
