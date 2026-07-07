import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./Pagination.module.css";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  siblingCount?: number;
  boundaryCount?: number;
};

type PageItem = number | "left-ellipsis" | "right-ellipsis";

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

function getPageItems(
  current: number,
  total: number,
  siblingCount: number,
  boundaryCount: number,
): PageItem[] {
  const totalShown = boundaryCount * 2 + siblingCount * 2 + 3;
  if (total <= totalShown) return range(1, total);

  const startPages = range(1, boundaryCount);
  const endPages = range(total - boundaryCount + 1, total);

  const siblingsStart = Math.max(
    Math.min(
      current - siblingCount,
      total - boundaryCount - siblingCount * 2 - 1,
    ),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
    total - boundaryCount - 1,
  );

  const items: PageItem[] = [...startPages];

  if (siblingsStart > boundaryCount + 2) {
    items.push("left-ellipsis");
  } else if (boundaryCount + 1 < total - boundaryCount) {
    items.push(boundaryCount + 1);
  }

  items.push(...range(siblingsStart, siblingsEnd));

  if (siblingsEnd < total - boundaryCount - 1) {
    items.push("right-ellipsis");
  } else if (total - boundaryCount > boundaryCount) {
    items.push(total - boundaryCount);
  }

  items.push(...endPages);
  return items;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  siblingCount = 1,
  boundaryCount = 1,
}: Props) {
  const [jumpOpen, setJumpOpen] = useState<null | "left" | "right">(null);
  const [jumpValue, setJumpValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (jumpOpen && inputRef.current) inputRef.current.focus();
  }, [jumpOpen]);

  if (totalPages <= 1) return null;

const goTo = (page: number) => {
  const clamped = Math.min(Math.max(1, page), totalPages);
  setJumpOpen(null);
  setJumpValue("");
  if (clamped !== currentPage) onPageChange(clamped);
};

  const submitJump = () => {
    const n = parseInt(jumpValue, 10);
    if (!Number.isNaN(n)) goTo(n);
    setJumpOpen(null);
    setJumpValue("");
  };

  const items = getPageItems(
    currentPage,
    totalPages,
    siblingCount,
    boundaryCount,
  );

  const renderEllipsis = (side: "left" | "right", key: string) => {
    if (jumpOpen === side) {
      return (
        <input
          key={key}
          ref={inputRef}
          type="number"
          min={1}
          max={totalPages}
          className={styles.jumpInput}
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          onBlur={submitJump}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitJump();
            if (e.key === "Escape") {
              setJumpOpen(null);
              setJumpValue("");
            }
          }}
          placeholder="…"
          aria-label="Nhập số trang"
        />
      );
    }
    
    return (
      <button
        key={key}
        type="button"
        className={`${styles.pageBtn} ${styles.ellipsis}`}
        onClick={() => {
          setJumpValue("");
          setJumpOpen(side);
        }}
        aria-label="Chọn số trang"
        title="Nhập số trang để nhảy nhanh"
      >
        …
      </button>
    );
  };

  return (
    <nav
      className={`${styles.pagination} ${className ?? ""}`}
      aria-label="Phân trang"
    >
      <button
        type="button"
        className={styles.pageBtn}
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Trang trước"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      {items.map((item, idx) => {
        if (item === "left-ellipsis") return renderEllipsis("left", `l-${idx}`);
        if (item === "right-ellipsis")
          return renderEllipsis("right", `r-${idx}`);
        return (
          <button
            key={item}
            type="button"
            className={
              item === currentPage
                ? `${styles.pageBtn} ${styles.active}`
                : styles.pageBtn
            }
            onClick={() => goTo(item)}
            aria-current={item === currentPage ? "page" : undefined}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        className={styles.pageBtn}
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Trang sau"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </nav>
  );
}
