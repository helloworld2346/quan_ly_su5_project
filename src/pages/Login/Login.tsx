import type { CSSProperties } from "react";

import styles from "./Login.module.css";

import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";

import logo from "../../assets/images/logo-su5.png";
import loginBg from "../../assets/images/login-bg-dongson.png";

const pageStyle = {
  "--login-bg": `url(${loginBg})`,
} as CSSProperties;

export default function Login() {
  return (
    <main className={styles.page} style={pageStyle}>
      <section className={styles.card} aria-labelledby="login-title">
        <img src={logo} alt="Logo Sư đoàn 5" className={styles.logo} />

        <header className={styles.branding}>
          <p className={styles.unitName}>Sư đoàn 5</p>
          <p className={styles.appName}>
            Phần mềm thống kê báo ban quân số
          </p>
        </header>

        <div className={styles.divider} role="presentation" />

        <h1 id="login-title" className={styles.title}>
          Đăng nhập
        </h1>

        <form className={styles.form}>
          <Input
            variant="compact"
            label="Tên đăng nhập"
            type="text"
            placeholder="Nhập tên đăng nhập"
          />

          <Input
            variant="compact"
            label="Mật khẩu"
            type="password"
            placeholder="Nhập mật khẩu"
          />

          <Button variant="compact" text="Đăng nhập" />
        </form>
      </section>
    </main>
  );
}
