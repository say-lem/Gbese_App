import { WebSocketServer, WebSocket } from "ws";
import { verifyAccessToken } from "../utils/auth.utils";
import { WebSocketMessage } from "../common/interfaces/WebSocket";
import { TokenExpiredError } from "jsonwebtoken";
import { IncomingMessage, Server } from "http";
import { createClient } from "redis";
import {
	REDIS_USERNAME,
	REDIS_PASSWORD,
	REDIS_HOST,
	REDIS_PORT,
} from "../config/constants";

class WebSocketManager {
	private static instances: Map<string, WebSocketManager> = new Map();
	private wss: WebSocketServer;
	private userSockets: Map<string, WebSocket>;
	private path: string;
	private redisClient: any;

	constructor(server: Server, path: string) {
		this.wss = new WebSocketServer({ noServer: true });
		this.path = path;
		this.userSockets = new Map();
		this.initializeRedis();
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

	private async initializeRedis() {
		this.redisClient = createClient({
			username: REDIS_USERNAME,
			password: REDIS_PASSWORD,
			socket: {
				host: REDIS_HOST,
				port: REDIS_PORT,
			},
		});

		await this.redisClient.connect().catch(console.error);
		this.redisClient.on("error", (err: any) => {
			console.error("Redis Client Error:", err);
		});
	}

	private handleServerUpgradeConnection(server: Server) {
		server.on("upgrade", (request, socket, head) => {
			// // for testing notification
			// if (request.url === this.path) {
			// 	request.headers["userId"] = "12345";
			// 	this.wss.handleUpgrade(request, socket, head, (ws) => {
			// 		this.wss.emit("connection", ws, request);
			// 	});
			// }
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
					if (error instanceof TokenExpiredError) {
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

	private async handleConnection(
		ws: WebSocket,
		request: IncomingMessage
	): Promise<void> {
		console.info("Total connected clients:", this.wss.clients.size);
		const userId = request.headers["userId"] as string;

		if (!userId) {
			ws.send(JSON.stringify({ error: "Unauthorized access" }));
			ws.close(4001, "Access unauthorized");
			return;
		}
		this.userSockets.set(userId, ws);

		// Check if user messages exists
		const ttl = await this.redisClient.ttl(`messages:${userId}`);

		if (ttl !== -2) {
			// Fetch stored messages from Redis
			const missedMessages = await this.redisClient.lRange(
				`messages:${userId}`,
				0,
				-1
			);
			if (missedMessages && Array.isArray(missedMessages)) {
				const channelMessages: string[] = [];
				const nonChannelMessages: string[] = [];

				missedMessages.forEach((msg) => {
					const parsedMsg = JSON.parse(msg);

					if (parsedMsg.path == this.path) {
						channelMessages.push(JSON.stringify(parsedMsg.message));
					}
					if (parsedMsg.path !== this.path) {
						nonChannelMessages.push(parsedMsg);
					}
				});

				console.log("length of chmsg:", channelMessages.length);
				console.log("length of non chmsg:", nonChannelMessages.length);

				this.sendQueuedMessages(ws, channelMessages, 1000);
				await this.redisClient.del(`messages:${userId}`);

				if (nonChannelMessages.length > 0) {
					nonChannelMessages.forEach(async (msg) => {
						await this.redisClient.rPush(
							`messages:${userId}`,
							JSON.stringify(msg)
						);
					});
				}
			}
		}

		console.info("Total connected clients:", this.wss.clients.size);
		ws.send(JSON.stringify({ message: "Connected" }));
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

	private sendQueuedMessages(ws: WebSocket, messages: string[], delay: number) {
		let timer: NodeJS.Timeout;
		function sendMessage() {
			if (messages.length > 0) {
				const message = messages.shift();
				try {
					ws.send(message!);
					timer = setTimeout(sendMessage, delay);
				} catch (error) {
					console.error("Failed to send message:", error);
				}
			}
		}
		// Start the sending process
		timer = setTimeout(sendMessage, delay);

		// Cleanup function
		return () => clearTimeout(timer);
	}

	public async sendNotification(userId: string, data: Object) {
		const ws = this.userSockets.get(userId);
		if (ws && ws.readyState == WebSocket.OPEN) {
			ws.send(JSON.stringify(data));
		} else {
			console.log(`User ${userId} is not connected`);
			const missedMessage = { path: this.path, message: data };
			// stores notification for offline users
			await this.redisClient.lPush(
				`messages:${userId}`,
				JSON.stringify(missedMessage)
			);

			// set expiry for messages for 24 hours upon saved new message
			await this.redisClient.expire(`messages:${userId}`, 86400);
		}
	}
}

export default WebSocketManager;
