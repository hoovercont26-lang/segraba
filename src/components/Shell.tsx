import Link from "next/link";
import { MobileTabBar } from "@/components/MobileTabBar";
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
            ? "relative z-10 flex-1 pb-tabbar"
            : "relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-tabbar sm:px-5 sm:py-10 lg:px-8 lg:py-12"
        }
      >
        {children}
      </main>
      <footer className="relative z-10 hidden border-t border-line sm:block">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm leading-6 text-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>Hecho en Perú · SeGraba</p>
          <div className="flex gap-4">
            <Link href="/como-funciona" className="underline underline-offset-4">
              Cómo funciona
            </Link>
            <Link href="/reportar" className="underline underline-offset-4">
              Reportes
            </Link>
            <Link href="/politicas" className="underline underline-offset-4">
              Políticas
            </Link>
          </div>
        </div>
      </footer>
      <MobileTabBar />
    </div>
  );
}
