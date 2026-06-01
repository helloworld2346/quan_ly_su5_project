import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

import styles from "./Sidebar.module.css";
import type { NavItem } from "../../../types/navigation";

type Props = {
  label: string;
  icon: IconProp;
  items: NavItem[];
  isOpen: boolean;
  onToggle: () => void;
  activeId: string;
  onNavigate: (id: string) => void;
  collapsed: boolean;
  onExpand?: () => void;
  isActive: boolean;
  onTooltipEnter?: (text: string, ref: React.RefObject<HTMLElement>) => void;
  onTooltipLeave?: () => void;
};

export default function NavGroup({
  label,
  icon,
  items,
  isOpen,
  onToggle,
  activeId,
  onNavigate,
  collapsed,
  onExpand,
  isActive,
  onTooltipEnter,
  onTooltipLeave,
}: Props) {
  const groupToggleRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (collapsed) {
      if (onExpand) onExpand();
      onToggle();
      return;
    }
    onToggle();
  };

  const handleGroupMouseEnter = () => {
    if (collapsed && onTooltipEnter) {
      onTooltipEnter(label, groupToggleRef);
    }
  };

  const handleGroupMouseLeave = () => {
    if (onTooltipLeave) {
      onTooltipLeave();
    }
  };

  return (
    <div className={styles.group}>
      <button
        ref={groupToggleRef}
        type="button"
        className={`${styles.groupToggle} ${isActive && collapsed ? styles.active : ""} ${isActive ? styles.groupActive : ""}`}
        aria-expanded={isOpen}
        aria-label={collapsed ? label : undefined}
        onClick={handleClick}
        onMouseEnter={handleGroupMouseEnter}
        onMouseLeave={handleGroupMouseLeave}
      >
        <span className={styles.groupLabel}>
          <FontAwesomeIcon icon={icon} className={styles.navIcon} />
          {!collapsed && label}
        </span>
        {!collapsed && (
          <span
            className={isOpen ? styles.chevronOpen : styles.chevron}
            aria-hidden
          >
            ▾
          </span>
        )}
      </button>

      {isOpen && !collapsed && (
        <ul className={styles.subList}>
          {items.map((item) => (
            <li key={item.id} className={styles.subLi}>
              <button
                type="button"
                className={
                  activeId === item.id
                    ? `${styles.subItem} ${styles.active}`
                    : styles.subItem
                }
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
