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
  disabled?: boolean;
}

interface DropdownPos {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
}

const DROPDOWN_OFFSET = 4;
const DEFAULT_MAX_HEIGHT = 220;
const MIN_DROPDOWN_HEIGHT = 120;

export default function CustomSelect({
  options,
  value,
  onChange,
  variant = "default",
  placeholder = "Chọn...",
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState<DropdownPos | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? placeholder;

  const calcPos = useCallback(
    (rect: DOMRect): DropdownPos => {
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom - DROPDOWN_OFFSET;
      const spaceAbove = rect.top - DROPDOWN_OFFSET;

      const width = Math.max(
        rect.width,
        variant === "table" ? 180 : rect.width,
      );

      if (spaceBelow >= MIN_DROPDOWN_HEIGHT || spaceBelow >= spaceAbove) {
        return {
          top: rect.bottom + window.scrollY + DROPDOWN_OFFSET,
          left: rect.left + window.scrollX,
          width,
          maxHeight: Math.min(
            DEFAULT_MAX_HEIGHT,
            Math.max(spaceBelow, MIN_DROPDOWN_HEIGHT),
          ),
        };
      }

      return {
        bottom: viewportHeight - rect.top + window.scrollY + DROPDOWN_OFFSET,
        left: rect.left + window.scrollX,
        width,
        maxHeight: Math.min(
          DEFAULT_MAX_HEIGHT,
          Math.max(spaceAbove, MIN_DROPDOWN_HEIGHT),
        ),
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

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
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
            className={styles.dropdown}
            style={{
              position: "absolute",
              ...(dropdownPos.top !== undefined
                ? { top: dropdownPos.top }
                : { bottom: dropdownPos.bottom }),
              left: dropdownPos.left,
              width: dropdownPos.width,
              maxHeight: dropdownPos.maxHeight,
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
      className={`${styles.wrapper} ${
        variant === "table" ? styles.tableVariant : ""
      }`}
    >
      <button
        type="button"
        disabled={disabled}
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""}`}
        onClick={() => {
          if (disabled) return;
          if (isOpen) {
            closeDropdown();
          } else {
            openDropdown();
          }
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          handleKeyDown(e);
        }}
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