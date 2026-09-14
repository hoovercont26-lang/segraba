import Link from "next/link";
import { Nav } from "@/components/Nav";

export function Shell({
  children,
  flush = false,
}: {
  children: React.ReactNode;
  flush?: boolean;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-bg text-ink">
      <Nav />
      <main
        className={
          flush
            ? "relative z-10 flex-1"
            : "relative z-10 mx-auto w-full max-w-5xl flex-1 px-5 py-10"
        }
      >
        {children}
      </main>
      <footer className="relative z-10 border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-8 text-sm leading-6 text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Hecho en Perú.</p>
          <div className="flex gap-4">
            <Link href="/como-funciona" className="underline underline-offset-4">
              Cómo funciona
            </Link>
            <Link href="/politicas" className="underline underline-offset-4">
              Políticas
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
