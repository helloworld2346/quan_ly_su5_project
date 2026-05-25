import styles from "./Button.module.css";

type Props = {
  text: string;
};

export default function Button({
  text,
}: Props) {
  return (
    <button className={styles.button}>
      {text}
    </button>
  );
}