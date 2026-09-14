import { EncargoDetail } from "@/components/EncargoDetail";
import { Shell } from "@/components/Shell";

export default async function PegaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Shell flush>
      <EncargoDetail id={id} />
    </Shell>
  );
}
