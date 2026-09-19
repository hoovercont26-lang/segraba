"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/",
    label: "Inicio",
    exact: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
        <path d="M12 3.2 4 9.5V21h5.5v-6.2h5V21H20V9.5L12 3.2Z" />
      </svg>
    ),
  },
  {
    href: "/pegas",
    label: "Avisos",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
        <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
      </svg>
    ),
  },
  {
    href: "/pegas/nueva",
    label: "Publicar",
    center: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
      </svg>
    ),
  },
  {
    href: "/cuenta",
    label: "Cuenta",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
        <path d="M12 12a4.2 4.2 0 1 0-4.2-4.2A4.2 4.2 0 0 0 12 12Zm0 2.2c-3.7 0-8 1.9-8 5.6V21h16v-1.2c0-3.7-4.3-5.6-8-5.6Z" />
      </svg>
    ),
  },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl sm:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {TABS.map((tab) => {
          const active =
            "exact" in tab && tab.exact
              ? pathname === "/"
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          if ("center" in tab && tab.center) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="-mt-5 flex flex-col items-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-flash text-flash-ink shadow-[0_0_16px_rgba(217,249,32,0.35)]">
                  {tab.icon}
                </span>
                <span className="mt-1 text-[10px] font-bold text-flash">
                  {tab.label}
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-w-[56px] flex-col items-center justify-center ${
                active ? "text-flash" : "text-muted"
              }`}
            >
              {tab.icon}
              <span className="mt-0.5 text-[10px] font-semibold">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
