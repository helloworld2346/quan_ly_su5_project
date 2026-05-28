import styles from "./LoadingScreen.module.css";
import logo from "../../../assets/images/logo-su5.png";

type Props = {
  title?: string;
  subtitle?: string;
};

export default function LoadingScreen({
  title = "Đang vào hệ thống",
  subtitle = "Đang tải dữ liệu…",
}: Props) {
  return (
    <div className={styles.root} role="status" aria-live="polite">
      <div className={styles.card}>
        <img className={styles.logo} src={logo} alt="" aria-hidden />
        <div className={styles.text}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <div className={styles.progress} aria-hidden>
          <span className={styles.bar} />
        </div>
      </div>
    </div>
  );
}
