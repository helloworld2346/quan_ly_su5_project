import { useEffect, useState } from "react";
import ModalShell from "../../components/ui/ModalShell/ModalShell";
import styles from "./FilePreviewModal.module.css";
import { politicalWorkService } from "../../services/politicalWork/politicalWorkService";
import { useToast } from "../../context/useToast";

type Props = {
  idCongtac: string;
  tenFile: string;
  onClose: () => void;
};

const getPreviewKind = (fileName: string, mime: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (
    mime.startsWith("image/") ||
    ["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(ext)
  )
    return "image";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  return "none";
};

export default function FilePreviewModal({
  idCongtac,
  tenFile,
  onClose,
}: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [kind, setKind] = useState<"image" | "pdf" | "none">("none");
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    let objectUrl: string | null = null;
    let active = true;
    (async () => {
      try {
        const blob = await politicalWorkService.downloadFile(idCongtac);
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        setKind(getPreviewKind(tenFile, blob.type));
      } catch {
        if (active) showError("Không tải được tệp đính kèm");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [idCongtac, tenFile, showError]);

  const handleDownload = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = tenFile || "tep-dinh-kem";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <ModalShell
      variant="plain"
      size="lg"
      onClose={onClose}
      title="Xem trước tệp đính kèm"
      subHeader={<span className={styles.fileName}>{tenFile}</span>}
    >
      <div className={styles.previewBody}>
        {loading ? (
          <div className={styles.previewState}>Đang tải tệp…</div>
        ) : url && kind === "image" ? (
          <img src={url} alt={tenFile} className={styles.previewImage} />
        ) : url && kind === "pdf" ? (
          <iframe src={url} title={tenFile} className={styles.previewFrame} />
        ) : (
          <div className={styles.previewState}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={styles.previewStateIcon}
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p>Tệp này không hỗ trợ xem trước.</p>
            <p className={styles.previewStateHint}>
              Tải xuống để xem bằng ứng dụng phù hợp.
            </p>
          </div>
        )}
      </div>
      <div className={styles.previewFooter}>
        <button type="button" className={styles.btnGhost} onClick={onClose}>
          Đóng
        </button>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={handleDownload}
          disabled={!url}
        >
          Tải xuống
        </button>
      </div>
    </ModalShell>
  );
}
