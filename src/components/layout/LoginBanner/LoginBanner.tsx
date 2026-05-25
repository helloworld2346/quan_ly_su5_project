import styles from "./LoginBanner.module.css";

export default function LoginBanner() {
  return (
    <div className={styles.loginLeft}>
      <div className={styles.overlay}></div>

      <div className={styles.leftContent}>
        <h1>SƯ ĐOÀN 5</h1>

        <div className={styles.line}></div>

        <h2>
          PHẦN MỀM CÔNG NGHỆ SỐ
          <br />
          CÔNG TÁC THAM MƯU HUẤN LUYỆN
        </h2>
      </div>
    </div>
  );
}