import { WebSocketManager } from "./WebSocketManager";

function resolveWsUrl(): string {
  const envUrl = import.meta.env.VITE_WS_URL;
  if (envUrl) return envUrl;
  
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

export const WebSocketLink = new WebSocketManager({
  url: resolveWsUrl(),
  reconnectInterval: 3000,
});
