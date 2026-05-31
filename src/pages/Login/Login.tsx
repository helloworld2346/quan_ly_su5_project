import { useState, useEffect } from "react"; 
import type { FormEvent } from "react";

import styles from "./Login.module.css";

import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";
import { authService } from "../../services/auth/authService";
import { storage, themeSession } from "../../utils/storage";
import type { LoginRequest } from "../../types/auth";
import { getErrorMessage } from "../../utils/errorHandler";
import { useToast } from "../../context/useToast";
import { loginValidation } from "../../utils/validation";

import logo from "../../assets/images/logo-su5.png";
import loginBg from "../../assets/images/login-bg-dongson.png";

const pageStyle = {
  "--login-bg": `url(${loginBg})`,
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

  // ← thêm block này
  useEffect(() => {
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
        themeSession.applyOnLogin(); // ← thêm dòng này
        showSuccess("Đăng nhập thành công!");
        onSuccess?.();
      } else {
        setError(response.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      if (!err.response) {
        showError("Không thể kết nối đến server. Vui lòng thử lại.");
      } else {
        setError(getErrorMessage(err));
      }
      console.error("Login error:", err);
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
          <p className={styles.appName}>Phần mềm thống kê báo ban quân số</p>
        </header>

        <div className={styles.divider} role="presentation" />

        <h1 id="login-title" className={styles.title}>
          Đăng nhập
        </h1>

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
      </section>
    </main>
  );
}