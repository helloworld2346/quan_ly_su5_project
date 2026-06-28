import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";

import { useTheme } from "../../../theme";

import styles from "../Settings.module.css";

export default function ThemeCard() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={styles.cardSection}>
      <div className={styles.cardHeader}>
        <FontAwesomeIcon
          icon={isDark ? faMoon : faSun}
          className={styles.cardHeaderIcon}
        />
        <h2 className={styles.cardTitle}>Giao diện</h2>
      </div>

      <div className={styles.themeRow}>
        <div className={styles.themeInfo}>
          <span className={styles.themeName}>
            {isDark ? "Giao diện tối" : "Giao diện sáng"}
          </span>
          <span className={styles.themeDesc}>
            Tùy chỉnh màu nền sáng/tối cho toàn bộ ứng dụng
          </span>
        </div>

        <div className={styles.themeOptions}>
          <button
            type="button"
            className={`${styles.themeOption} ${!isDark ? styles.themeOptionActive : ""}`}
            onClick={() => {
              if (isDark) toggleTheme();
            }}
            aria-pressed={!isDark}
          >
            <FontAwesomeIcon icon={faSun} />
            <span>Sáng</span>
          </button>
          <button
            type="button"
            className={`${styles.themeOption} ${isDark ? styles.themeOptionActive : ""}`}
            onClick={() => {
              if (!isDark) toggleTheme();
            }}
            aria-pressed={isDark}
          >
            <FontAwesomeIcon icon={faMoon} />
            <span>Tối</span>
          </button>
        </div>
      </div>
    </div>
  );
}
