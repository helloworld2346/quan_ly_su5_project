import { useState, useCallback, useRef } from "react";

type DialogType = "danger" | "warning" | "info";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions;
  resolve: ((value: boolean) => void) | null;
}

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    options: {
      title: "",
      message: "",
    },
    resolve: null,
  });

  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    setState({
      isOpen: false,
      options: { title: "", message: "" },
      resolve: null,
    });
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    setState({
      isOpen: false,
      options: { title: "", message: "" },
      resolve: null,
    });
  }, []);

  return {
    confirm,
    isOpen: state.isOpen,
    options: state.options,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };
}
