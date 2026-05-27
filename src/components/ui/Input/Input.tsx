import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import styles from "./Input.module.css";

type InputType = "text" | "password" | "email";

type Props = {
  label: string;
  type?: InputType;
  placeholder?: string;
  id?: string;
  variant?: "default" | "compact";
};

function toFieldId(label: string) {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export default function Input({
  label,
  type = "text",
  placeholder,
  id,
  variant = "default",
}: Props) {
  const fieldId = id ?? toFieldId(label);

  const [showPassword, setShowPassword] = useState(false);

  const groupClass =
    variant === "compact"
      ? `${styles.formGroup} ${styles.compact}`
      : styles.formGroup;

  const isPasswordType = type === "password";

  const currentInputType = isPasswordType && showPassword ? "text" : type;

  return (
    <div className={groupClass}>
      <label htmlFor={fieldId}>{label}</label>

      <div className={styles.inputContainer}>
        <input
          id={fieldId}
          type={currentInputType}
          placeholder={placeholder}
          autoComplete={isPasswordType ? "current-password" : "username"}
          className={isPasswordType ? styles.passwordInput : ""}
        />

        {isPasswordType && (
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
            title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        )}
      </div>
    </div>
  );
}
