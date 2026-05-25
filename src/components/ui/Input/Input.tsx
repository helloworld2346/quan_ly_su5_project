import styles from "./Input.module.css";

type Props = {
  label: string;
  type: string;
  placeholder: string;
};

export default function Input({
  label,
  type,
  placeholder,
}: Props) {
  return (
    <div className={styles.formGroup}>
      <label>{label}</label>

      <input
        type={type}
        placeholder={placeholder}
      />
    </div>
  );
}