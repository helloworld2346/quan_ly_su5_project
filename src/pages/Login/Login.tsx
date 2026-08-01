import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

import styles from "./Login.module.css";

import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";
import { authService } from "../../services/auth/authService";
import { storage } from "../../utils/storage";
import { themeSession } from "../../utils/themeStorage";
import type { LoginRequest } from "../../types/auth";
import { getErrorMessage } from "../../utils/errorHandler";
import { useToast } from "../../context/useToast";
import { loginValidation } from "../../utils/validation";

import logo from "../../assets/images/logo-su5.png";
import loginBg from "../../assets/images/login-bg-dongson.png";
import loginFooter from "../../assets/images/login-footer.png";

const pageStyle = {
  "--login-bg": `url(${loginBg})`,
  "--login-footer": `url(${loginFooter})`,
} as React.CSSProperties;

type Props = {
  onSuccess?: () => void;
};

export default function Login({ onSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    document.title = "Đăng nhập | Phần mềm thống kê Sư đoàn 5";
    themeSession.applyOnAppStart(!!storage.getToken());
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const usernameError = loginValidation.username(username);
    if (usernameError) {
      setError(usernameError);
      setLoading(false);
      return;
    }

    const passwordError = loginValidation.password(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const credentials: LoginRequest = {
        userName: username,
        password: password,
      };

      const response = await authService.login(credentials);

      if (response.success && response.Result.token) {
        storage.setToken(response.Result.token);
        themeSession.applyOnLogin();
        showSuccess("Đăng nhập thành công!");
        onSuccess?.();
      } else {
        setError(response.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      const errObj = err as AxiosError;
      if (!errObj.response) {
        showError("Không thể kết nối đến server. Vui lòng thử lại.");
      } else {
        setError(getErrorMessage(errObj));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page} style={pageStyle}>
      <section className={styles.card} aria-labelledby="login-title">
        <img src={logo} alt="Logo Sư đoàn 5" className={styles.logo} />

        <header className={styles.branding}>
          <p className={styles.unitName}>Sư đoàn 5</p>
          <p className={styles.appName}>
            THỐNG KÊ QUÂN SỐ,
            <br />
            HOẠT ĐỘNG CTĐ, CTCT
          </p>
        </header>

        <div className={styles.divider} role="presentation" />

        <div className={styles.welcome}>
          <h1 id="login-title" className={styles.welcomeTitle}>
            Chào mừng trở lại!
          </h1>
          <p className={styles.welcomeDesc}>
            Vui lòng đăng nhập để tiếp tục sử dụng hệ thống
          </p>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            variant="compact"
            label="Tên đăng nhập"
            type="text"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />

          <Input
            variant="compact"
            label="Mật khẩu"
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Button
            variant="compact"
            text={loading ? "Đang đăng nhập..." : "Đăng nhập"}
            disabled={loading}
          />
        </form>


        <footer className={styles.security}>
          <div className={styles.securityIcon}>
            <ShieldCheckIcon className={styles.securitySvg} />
          </div>
          <span>Hệ thống được bảo mật theo tiêu chuẩn Quân đội</span>
        </footer>
      </section>
    </main>
  );
}