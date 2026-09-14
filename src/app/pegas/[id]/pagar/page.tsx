import { redirect } from "next/navigation";

export default async function PagarRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/pegas/${id}`);
}
