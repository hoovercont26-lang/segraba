import { AuthGate } from "@/components/AuthGate";
import { ChatRoom } from "@/components/ChatRoom";
import { Shell } from "@/components/Shell";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Shell>
      <AuthGate>
        <ChatRoom id={id} />
      </AuthGate>
    </Shell>
  );
}
