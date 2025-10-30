import { NextRequest } from "next/server";

let clients: any[] = [];

export const GET = (req: NextRequest) => {
  const { socket } = req as any;

  if (!socket || !socket.server) {
    return new Response("No socket server", { status: 500 });
  }

  if (!socket.server.wss) {
    console.log("Starting WebSocket server...");
    const { Server } = require("ws");
    socket.server.wss = new Server({ noServer: true });

    socket.server.on("upgrade", (request: any, socket: any, head: any) => {
      if (request.url === "/api/socket") {
        socket.server.wss.handleUpgrade(request, socket, head, (ws: any) => {
          socket.server.wss.emit("connection", ws, request);
        });
      }
    });

    socket.server.wss.on("connection", (ws: any) => {
      clients.push(ws);
      console.log("Client connected, total:", clients.length);

      ws.on("close", () => {
        clients = clients.filter((client) => client !== ws);
        console.log("Client disconnected, total:", clients.length);
      });
    });
  }

  return new Response("Socket server running", { status: 200 });
};

// Helper function to broadcast messages
export function broadcastMessage(message: any) {
  clients.forEach((client) => {
    try {
      client.send(JSON.stringify(message));
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  });
}
