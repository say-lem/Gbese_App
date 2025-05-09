import { WebSocketServer, WebSocket } from "ws";
import { verifyAccessToken } from "../utils/auth.utils";
import {
	WebSocketMessage,
	WSAuthRequest,
} from "../common/interfaces/WebSocket";
import { IncomingMessage, Server } from "http";
import * as jwt from "jsonwebtoken";

class WebSocketManager {
	private static instances: Map<string, WebSocketManager> = new Map();
	private wss: WebSocketServer;
	private userSockets: Map<string, WebSocket>;
	private path: string;

	constructor(server: Server, path: string) {
		this.wss = new WebSocketServer({ noServer: true });
		this.path = path;
		this.userSockets = new Map();
		this.initialize();
		this.handleServerUpgradeConnection(server);
	}
	public static getInstance(server: Server, path: string) {
		if (!WebSocketManager.instances.has(path)) {
			WebSocketManager.instances.set(path, new WebSocketManager(server, path));
		}
		return WebSocketManager.instances.get(path);
	}

	private initialize(): void {
		this.wss.on("connection", this.handleConnection.bind(this));
	}

	private handleServerUpgradeConnection(server: Server) {
		server.on("upgrade", (request, socket, head) => {
			if (request.url === this.path) {
				const token = this.getUserToken(request);
				if (!token) {
					console.error("Token missing, rejecting connection");
					socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
					socket.destroy();
					return;
				}
				try {
					const verifiedToken = verifyAccessToken(token) as { userId: string };
					request.headers["userId"] = verifiedToken.userId;
					console.log(request.headers["userId"]);
				} catch (error) {
					console.log(error);
					if (error instanceof jwt.TokenExpiredError) {
						socket.write("HTTP/1.1 401 Unauthorized, session expired\r\n\r\n");
					}
					socket.write("HTTP/1.1 500 Unable to connect. Unknown Error\r\n\r\n");
					socket.destroy();
					return;
				}
				console.log(`upgrading connection for path: ${this.path}`);
				this.wss.handleUpgrade(request, socket, head, (ws) => {
					this.wss.emit("connection", ws, request);
				});
			}
		});
	}

	private handleConnection(ws: WebSocket, request: IncomingMessage): void {
		console.info("Total connected clients:", this.wss.clients.size);
		const userId = request.headers["userId"] as string;

		if (!userId) {
			ws.send(JSON.stringify({ error: "Unauthorized access" }));
			ws.close(4001, "Access unauthorized");
			return;
		}
		this.userSockets.set(userId, ws);
		console.info("Total connected clients:", this.wss.clients.size);
		ws.send(JSON.stringify({ message: `Welcome to ${this.path} WebSocket!` }));
		ws.on("message", (message: Buffer) => {
			try {
				const data: WebSocketMessage = JSON.parse(message.toString());
				this.handleMessage(ws, data, userId);
			} catch (error) {
				console.error("Failed to parse message:", error);
				ws.send(JSON.stringify({ error: "Invalid message format" }));
			}
		});

		ws.on("close", () => this.handleDisconnection(ws));
		ws.on("error", (error) => console.error("WebSocket error:", error));
	}

	private handleMessage(
		ws: WebSocket,
		data: WebSocketMessage,
		userId: string
	): void {
		const user = this.userSockets.get(userId);

		if (data.type === "register" && user) {
			console.log(`User registered`);
			ws.send(JSON.stringify({ type: "registered", success: true }));
			console.info("Total connected clients:", this.wss.clients.size);
		}
	}

	private handleDisconnection(ws: WebSocket): void {
		console.log("Client disconnected");
		for (const [userId, socket] of this.userSockets.entries()) {
			if (socket === ws) {
				this.userSockets.delete(userId);
				console.log(`User ${userId} unregistered`);
				console.info("Total connected clients:", this.wss.clients.size);
				break;
			}
		}
	}

	private getUserToken(request: any) {
		const reqHeader = request.headers.authorization;
		const token = reqHeader?.startsWith("Bearer")
			? reqHeader.split(" ")[1]
			: null;
		return token;
	}

	public sendNotification(userId: string, data: Object) {
		const ws = this.userSockets.get(userId);
		if (ws && ws.readyState == WebSocket.OPEN) {
			ws.send(JSON.stringify(data));
		} else {
			console.log(`User ${userId} is not connected`);
		}
	}
}

export default WebSocketManager;
