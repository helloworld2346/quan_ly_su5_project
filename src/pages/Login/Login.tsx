import styles from "./Login.module.css";

import LoginBanner from "../../components/layout/LoginBanner/LoginBanner";

import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";

import logo from "../../assets/images/logo-su5.png";

export default function Login() {
  return (
    <div className={styles.loginContainer}>
      <LoginBanner />

      <div className={styles.loginRight}>
        <div className={styles.loginBox}>
          {/* LOGO */}
          <div className={styles.logoArea}>
            <img
              src={logo}
              alt="Logo"
              className={styles.logo}
            />
          </div>

          {/* TITLE */}
          <h1>ĐĂNG NHẬP</h1>

          {/* FORM */}
          <form className={styles.loginForm}>
            <Input
              label="Tên đăng nhập"
              type="text"
              placeholder="Nhập tên đăng nhập"
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu"
            />

            <Button text="Đăng nhập" />
          </form>
        </div>
      </div>
    </div>
  );
}