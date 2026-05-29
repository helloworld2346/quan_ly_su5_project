import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

import styles from "./Sidebar.module.css";
import type { NavItem, NavItemId } from "../../../types/navigation";

type Props = {
  label: string;
  icon: IconProp;
  items: NavItem[];
  isOpen: boolean;
  onToggle: () => void;
  activeId: NavItemId;
  onNavigate: (id: NavItemId) => void;
  collapsed: boolean;
  onExpand?: () => void;
  isActive: boolean;
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
}: Props) {
  const handleClick = () => {
    if (collapsed) {
      if (onExpand) onExpand();
      onToggle();
      return;
    }
    onToggle();
  };

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={`${styles.groupToggle} ${isActive && collapsed ? styles.active : ""} ${isActive ? styles.groupActive : ""}`}
        aria-expanded={isOpen}
        data-tooltip={collapsed ? label : undefined}
        aria-label={collapsed ? label : undefined}
        onClick={handleClick}
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
