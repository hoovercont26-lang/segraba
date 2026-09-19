import { AuthGate } from "@/components/AuthGate";
import { PagoPrimera } from "@/components/PagoPrimera";
import { Shell } from "@/components/Shell";

export default async function PagarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Shell>
      <AuthGate rol="marca" next={`/pegas/${id}/pagar`}>
        <PagoPrimera id={id} />
      </AuthGate>
    </Shell>
  );
}
