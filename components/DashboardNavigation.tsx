import Link from "next/link";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", id: "dashboard" },
  { href: "/screener", label: "Stock Screener", id: "screener" },
  { href: "/predictions", label: "AI Predictions", id: "predictions" },
  { href: "/settings", label: "Settings", id: "settings" },
] as const;

type DashboardNavigationProps = {
  activePage: (typeof navigationItems)[number]["id"];
};

export default function DashboardNavigation({
  activePage,
}: DashboardNavigationProps) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 px-4 pb-3 pt-4 backdrop-blur md:hidden">
        <Link href="/dashboard" className="text-2xl font-bold text-green-400">
          AlphaMind
        </Link>
        <nav
          aria-label="Main navigation"
          className="mobile-nav-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1"
        >
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-current={activePage === item.id ? "page" : undefined}
              className={`shrink-0 rounded-xl px-3 py-2 text-sm transition ${
                activePage === item.id
                  ? "bg-green-500/20 font-semibold text-green-400"
                  : "text-zinc-400 hover:bg-zinc-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 p-6 md:flex">
        <Link href="/dashboard" className="text-3xl font-bold text-green-400">
          AlphaMind
        </Link>
        <nav aria-label="Main navigation" className="mt-12 space-y-4">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-current={activePage === item.id ? "page" : undefined}
              className={`block rounded-2xl px-4 py-3 transition ${
                activePage === item.id
                  ? "bg-green-500/20 text-green-400"
                  : "text-zinc-400 hover:bg-zinc-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
