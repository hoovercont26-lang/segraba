import { AuthGate } from "@/components/AuthGate";
import { CuentaPanel } from "@/components/CuentaPanel";
import { Shell } from "@/components/Shell";

export default function CuentaPage() {
  return (
    <Shell>
      <AuthGate>
        <CuentaPanel />
      </AuthGate>
    </Shell>
  );
}
