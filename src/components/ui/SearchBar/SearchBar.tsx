import { useId } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import styles from "./SearchBar.module.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Bạn cần tìm gì!?",
  className,
}: Props) {
  const searchId = useId();

  return (
    <div className={`${styles.searchWrap} ${className ?? ""}`}>
      <input
        id={searchId}
        type="search"
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
      <span className={styles.searchDivider} aria-hidden />
      <button
        type="button"
        className={styles.searchIconBtn}
        aria-label="Tìm kiếm"
        onClick={() => document.getElementById(searchId)?.focus()}
      >
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className={styles.searchIcon}
        />
      </button>
    </div>
  );
}
