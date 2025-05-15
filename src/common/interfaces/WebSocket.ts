
import { IncomingMessage } from "node:http";
import { WSMessage } from "../types/WebSocketTypes";

export interface WebSocketMessage {
    type: WSMessage;
    [key: string]: any;
}

export interface WSAuthRequest extends IncomingMessage {
    userId?: string;
}
