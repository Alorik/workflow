
import Pusher from "pusher";
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export function broadcastMessage({ projectId, type, data }: any) {
  const eventMap: Record<string, string> = {
    TASK_CREATED: "task-created",
    TASK_UPDATED: "task-updated",
    TASK_DELETED: "task-deleted",
  };

  const eventName = eventMap[type];
  if (!eventName) return;

  pusherServer.trigger(`project-${projectId}`, eventName, data);
}