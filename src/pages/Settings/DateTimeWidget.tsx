import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faClock } from "@fortawesome/free-solid-svg-icons";
import styles from "./DateTimeWidget.module.css";

const WEEKDAYS = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function DateTimeWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const weekday = WEEKDAYS[now.getDay()];
  const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
        <span className={styles.text}>
          {weekday}, {dateStr}
        </span>
      </div>
      <div className={styles.divider} />
      <div className={styles.row}>
        <FontAwesomeIcon icon={faClock} className={styles.icon} />
        <span className={styles.text}>{timeStr}</span>
      </div>
    </div>
  );
}