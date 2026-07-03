import type { ReactNode } from "react";
import styles from "./StatCard.module.css";

export type StatCardTone = "green" | "blue" | "orange" | "red" | "purple";

export default function StatCard({
  tone,
  icon,
  title,
  value,
}: {
  tone: StatCardTone;
  icon: ReactNode;
  title: string;
  value: number | string;
}) {
  return (
    <article className={styles.card}>
      <span className={`${styles.icon} ${styles[`icon--${tone}`]}`}>
        {icon}
      </span>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}
