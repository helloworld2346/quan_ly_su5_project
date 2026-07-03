import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "../../../context/useAuth"; 
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheck, faTrash } from "@fortawesome/free-solid-svg-icons";
import styles from "./NotificationBell.module.css";

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}



function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export default function NotificationBell() {
  const { notifications, markRead, markAllRead, clearRead } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const openDropdown = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY + 8,
      right: window.innerWidth - rect.right - window.scrollX,
    });
    setIsOpen(true);
  }, []);

  const toggleOpen = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      openDropdown();
    }
  }, [isOpen, openDropdown]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        btnRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      )
        return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right - window.scrollX,
      });
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen]);

  const dropdown = isOpen
    ? createPortal(
        <div
          ref={dropdownRef}
          className={styles.dropdown}
          style={{
            position: "absolute",
            top: dropdownPos.top,
            right: dropdownPos.right,
          }}
        >
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>
              Thông báo
              {unreadCount > 0 && (
                <span className={styles.headerBadge}>{unreadCount}</span>
              )}
            </span>
            <div className={styles.headerActions}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={markAllRead}
                  title="Đánh dấu tất cả đã đọc"
                >
                  <FontAwesomeIcon icon={faCheck} />
                  <span>Đọc tất cả</span>
                </button>
              )}
              {notifications.some((n) => n.isRead) && (
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                  onClick={clearRead}
                  title="Xóa thông báo đã đọc"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
          </div>

          <ul className={styles.list}>
            {notifications.length === 0 ? (
              <li className={styles.empty}>Không có thông báo nào</li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className={`${styles.item} ${n.isRead ? styles.itemRead : ""}`}
                  onClick={() => markRead(n.id)}
                >
                  {!n.isRead && <span className={styles.unreadDot} />}
                  <div className={styles.itemContent}>
                    <div className={styles.itemTitle}>{n.title}</div>
                    <div className={styles.itemMessage}>{n.message}</div>
                    <div className={styles.itemTime}>
                      {formatRelativeTime(n.time)}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`${styles.bellBtn} ${isOpen ? styles.bellBtnOpen : ""}`}
        aria-label="Thông báo"
        onClick={toggleOpen}
      >
        <FontAwesomeIcon icon={faBell} />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {dropdown}
    </>
  );
}
