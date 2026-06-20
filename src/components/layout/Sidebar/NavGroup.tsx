import { useRef, useLayoutEffect } from "react";
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
  activeId: string;
  onNavigate: (id: NavItemId) => void;
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
  const listRef = useRef<HTMLUListElement>(null);
  const connectorRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const connector = connectorRef.current;
    if (!connector) return;

    if (!isOpen || collapsed || !listRef.current) {
      connector.style.display = "none";
      return;
    }

    const activeIndex = items.findIndex((item) => item.id === activeId);
    if (activeIndex === -1) {
      connector.style.display = "none";
      return;
    }

    const liElements =
      listRef.current.querySelectorAll<HTMLElement>(":scope > li");
    const activeLi = liElements[activeIndex];
    if (!activeLi) {
      connector.style.display = "none";
      return;
    }

    connector.style.height = `${activeLi.offsetTop + activeLi.offsetHeight / 2}px`;
    connector.style.display = "block";
  }, [activeId, isOpen, collapsed, items]);

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
      onTooltipEnter(label, groupToggleRef as React.RefObject<HTMLElement>);
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
        className={`${styles.groupToggle} ${isActive ? styles.groupActive : ""}`}
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
        <ul ref={listRef} className={styles.subList}>
          <div ref={connectorRef} className={styles.activeConnector} />
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
