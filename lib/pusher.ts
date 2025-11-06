import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Define allowed event types
type EventType = "TASK_CREATED" | "TASK_UPDATED" | "TASK_DELETED";

// Define the data structure for broadcasted messages
interface BroadcastMessageParams {
  projectId: string;
  type: EventType;
  data: unknown; // use a specific interface if you know your data structure
}

export function broadcastMessage({
  projectId,
  type,
  data,
}: BroadcastMessageParams) {
  const eventMap: Record<EventType, string> = {
    TASK_CREATED: "task-created",
    TASK_UPDATED: "task-updated",
    TASK_DELETED: "task-deleted",
  };

  const eventName = eventMap[type];
  pusherServer.trigger(`project-${projectId}`, eventName, data);
}
