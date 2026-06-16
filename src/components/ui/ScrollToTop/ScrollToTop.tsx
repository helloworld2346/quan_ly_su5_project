import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import styles from "./ScrollToTop.module.css";

const SCROLL_THRESHOLD = 300;

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return createPortal(
    <button
      type="button"
      className={styles.btn}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Cuộn về đầu trang"
      title="Cuộn về đầu trang"
    >
      <FontAwesomeIcon icon={faArrowUp} />
    </button>,
    document.body,
  );
}
