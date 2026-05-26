import styles from "./Button.module.css";

type Props = {
  text: string;
  type?: "button" | "submit";
  variant?: "default" | "compact";
};

export default function Button({
  text,
  type = "submit",
  variant = "default",
}: Props) {
  const className =
    variant === "compact"
      ? `${styles.button} ${styles.compact}`
      : styles.button;

  return (
    <button type={type} className={className}>
      {text}
    </button>
  );
}
