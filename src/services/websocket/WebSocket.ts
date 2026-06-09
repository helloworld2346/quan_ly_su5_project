import { WebSocketManager } from "./WebSocketManager";

export const WebSocketLink = new WebSocketManager({
  url: import.meta.env.VITE_WS_URL ?? "ws://localhost:8080/ws",
  reconnectInterval: 3000,
});
