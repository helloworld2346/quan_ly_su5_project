export interface WebSocketOptions {
  url: string;
  onMessage?: (data: unknown) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnectInterval?: number;
}

export class WebSocketManager {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private manuallyClosed = false;
  private options: WebSocketOptions;

  constructor(options: WebSocketOptions) {
    this.options = options;
  }

  connect() {
    this.manuallyClosed = false;

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.socket = new WebSocket(this.options.url);

    this.socket.onopen = () => {
      if (import.meta.env.DEV) {
        console.log("🟢 Connected");
      }
      this.options.onOpen?.();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        this.options.onMessage?.(data);
      } catch {
        this.options.onMessage?.(event.data);
      }
    };

    this.socket.onclose = () => {
      if (import.meta.env.DEV) {
        console.log("🔴 Disconnected");
      }
      this.options.onClose?.();

      if (this.manuallyClosed) {
        return;
      }

      this.reconnectTimer = window.setTimeout(
        () => this.connect(),
        this.options.reconnectInterval ?? 3000,
      );
    };

    this.socket.onerror = (error) => {
      if (import.meta.env.DEV) {
        console.error("WebSocket Error", error);
      }
    };
  }

  send(data: unknown) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }

  disconnect() {
    this.manuallyClosed = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.socket?.close(1000, "Manual Close");
  }

  setOnOpen(callback: () => void) {
    this.options.onOpen = callback;
  }

  setOnMessage(callback: (data: unknown) => void) {
    this.options.onMessage = callback;
  }

  setOnClose(callback: () => void) {
    this.options.onClose = callback;
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}