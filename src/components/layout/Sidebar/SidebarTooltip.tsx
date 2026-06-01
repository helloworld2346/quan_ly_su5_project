import { useEffect, useRef, useState } from "react";
import styles from "./SidebarTooltip.module.css";

type Props = {
  text: string;
  visible: boolean;
  targetRef: React.RefObject<HTMLElement>;
};

export default function SidebarTooltip({ text, visible, targetRef }: Props) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !targetRef.current || !tooltipRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const left = targetRect.right + 10;
    const top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;

    setPosition({ top, left });
  }, [visible, targetRef]);

  if (!visible) return null;

  return (
    <div
      ref={tooltipRef}
      className={styles.tooltip}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      {text}
    </div>
  );
}
