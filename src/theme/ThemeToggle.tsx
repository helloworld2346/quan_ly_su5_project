// src/theme/ThemeToggle.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

type Props = {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
  activeClassName?: string;
};

export default function ThemeToggle({
  isDark,
  onToggle,
  className = "",
  activeClassName = "",
}: Props) {
  return (
    <button
      type="button"
      className={`${className} ${isDark ? activeClassName : ""}`.trim()}
      aria-label={
        isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"
      }
      onClick={onToggle}
    >
      <FontAwesomeIcon icon={isDark ? faSun : faMoon} />
    </button>
  );
}