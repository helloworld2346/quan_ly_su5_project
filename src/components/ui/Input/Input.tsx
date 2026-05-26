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
  const groupClass =
    variant === "compact"
      ? `${styles.formGroup} ${styles.compact}`
      : styles.formGroup;

  return (
    <div className={groupClass}>
      <label htmlFor={fieldId}>{label}</label>
      <input
        id={fieldId}
        type={type}
        placeholder={placeholder}
        autoComplete={type === "password" ? "current-password" : "username"}
      />
    </div>
  );
}
