import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// ✅ CHANGE #1: Added "COMMENT_ADDED" to EventType
export type EventType =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_DELETED"
  | "COMMENT_ADDED"; // <-- ✅ new event type added

// Define the data structure for broadcasted messages
interface BroadcastMessageParams {
  projectId?: string; // ✅ CHANGE #2: made optional, since comments may not use projectId directly
  type: EventType;
  data: unknown;
}

export function broadcastMessage({
  projectId,
  type,
  data,
}: BroadcastMessageParams) {
  // ✅ CHANGE #3: Added mapping for the new event
  const eventMap: Record<EventType, string> = {
    TASK_CREATED: "task-created",
    TASK_UPDATED: "task-updated",
    TASK_DELETED: "task-deleted",
    COMMENT_ADDED: "comment-added", // <-- ✅ new event mapping added
  };

  // Use the mapped event name or fallback
  const eventName = eventMap[type];

  // ✅ CHANGE #4: Handle events without project context gracefully
  const channel = projectId ? `project-${projectId}` : "workflow-channel";

  pusherServer.trigger(channel, eventName, data);
}
