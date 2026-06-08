import { WebSocketManager }
    from "./WebSocketManager";

export const WebSocketLink =
    new WebSocketManager({
        url:
            "ws://192.168.1.14:8080/ws",
        reconnectInterval: 3000
    });