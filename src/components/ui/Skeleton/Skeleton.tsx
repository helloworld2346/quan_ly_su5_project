import styles from "./Skeleton.module.css";

export default function Skeleton({
  width = "100%",
  height = 16,
  radius = 6,
  className,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.skeleton}${className ? ` ${className}` : ""}`}
      style={{ width, height, borderRadius: radius }}
    />
  );
}
