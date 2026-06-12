import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import styles from "./ScrollToTop.module.css";

export default function ScrollToTop() {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return createPortal(
    <button
      type="button"
      className={styles.btn}
      onClick={handleClick}
      aria-label="Cuộn về đầu trang"
      title="Cuộn về đầu trang"
    >
      <FontAwesomeIcon icon={faArrowUp} />
    </button>,
    document.body,
  );
}
