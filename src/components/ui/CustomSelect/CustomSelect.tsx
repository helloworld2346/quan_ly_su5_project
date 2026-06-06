import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons";
import styles from "./CustomSelect.module.css";

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  variant?: "default" | "table";
  placeholder?: string;
}

interface DropdownPos {
  top: number;
  left: number;
  width: number;
  openUpward: boolean;
}

const DROPDOWN_MAX_HEIGHT = 220;
const DROPDOWN_OFFSET = 4;

export default function CustomSelect({
  options,
  value,
  onChange,
  variant = "default",
  placeholder = "Chọn...",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState<DropdownPos | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? placeholder;

  const calcPos = useCallback(
    (rect: DOMRect): DropdownPos => {
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward =
        spaceBelow < DROPDOWN_MAX_HEIGHT + DROPDOWN_OFFSET &&
        rect.top > DROPDOWN_MAX_HEIGHT + DROPDOWN_OFFSET;

      return {
        top: openUpward
          ? rect.top + window.scrollY - DROPDOWN_MAX_HEIGHT - DROPDOWN_OFFSET
          : rect.bottom + window.scrollY + DROPDOWN_OFFSET,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, variant === "table" ? 180 : rect.width),
        openUpward,
      };
    },
    [variant],
  );

  const openDropdown = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setDropdownPos(calcPos(rect));
    setIsOpen(true);
    setFocusedIndex(options.findIndex((o) => o.value === value));
  }, [options, value, calcPos]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, closeDropdown]);

  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownPos(calcPos(rect));
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen, calcPos]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }
    if (e.key === "Escape") {
      closeDropdown();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      onChange(options[focusedIndex].value);
      closeDropdown();
    }
  };

  const dropdownEl =
    isOpen && dropdownPos
      ? createPortal(
          <ul
            className={`${styles.dropdown} ${dropdownPos.openUpward ? styles.dropdownUpward : ""}`}
            style={{
              position: "absolute",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              return (
                <li
                  key={opt.value}
                  className={[
                    styles.option,
                    i === focusedIndex ? styles.optionFocused : "",
                    isSelected ? styles.optionSelected : "",
                  ].join(" ")}
                  onMouseEnter={() => setFocusedIndex(i)}
                  onClick={() => {
                    onChange(opt.value);
                    closeDropdown();
                  }}
                >
                  {opt.label}
                  {isSelected && (
                    <FontAwesomeIcon
                      icon={faCheck}
                      className={styles.checkIcon}
                      size="xs"
                    />
                  )}
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${variant === "table" ? styles.tableVariant : ""}`}
    >
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""}`}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.triggerLabel}>{selectedLabel}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          size="xs"
        />
      </button>
      {dropdownEl}
    </div>
  );
}
