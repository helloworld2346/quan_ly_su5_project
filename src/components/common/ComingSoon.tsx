import styles from "./ComingSoon.module.css";

type Props = {
  title?: string;
  message?: string;
};

export default function ComingSoon({
  title = "Tính năng đang phát triển",
  message = "Chức năng này sẽ được cập nhật trong phiên bản tiếp theo.",
}: Props) {
  return (
    <section className={styles.comingSoon}>
      <h2 className={styles.comingSoonTitle}>{title}</h2>
      <p className={styles.comingSoonText}>{message}</p>
    </section>
  );
}
