import type { ReactNode } from "react";
import styles from "./StatCard.module.css";
import Skeleton from "../Skeleton/Skeleton";
import { formatNum } from "../../../utils/reportUtils";

export type StatCardTone = "green" | "blue" | "orange" | "red" | "purple";

export default function StatCard({
  tone,
  icon,
  title,
  value,
  loading = false,
}: {
  tone: StatCardTone;
  icon: ReactNode;
  title: string;
  value: number | string;
  loading?: boolean;
}) {
  return (
    <article className={styles.card}>
      <span className={`${styles.icon} ${styles[`icon--${tone}`]}`}>
        {icon}
      </span>
      <div>
        <p>{title}</p>
        {loading ? (
          <Skeleton width={72} height={26} radius={8} />
        ) : (
          <strong>
            {typeof value === "number" ? formatNum(value) : value}
          </strong>
        )}
      </div>
    </article>
  );
}
  