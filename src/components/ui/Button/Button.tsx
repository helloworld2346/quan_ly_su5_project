import styles from "./Button.module.css";

type Props = {
  text: string;
  type?: "button" | "submit";
  variant?: "default" | "compact";
  disabled?: boolean;
};

export default function Button({
  text,
  type = "submit",
  variant = "default",
  disabled = false,
}: Props) {
  const className =
    variant === "compact"
      ? `${styles.button} ${styles.compact}`
      : styles.button;

  return (
    <button type={type} className={className} disabled={disabled}>
      {text}
    </button>
  );
}
