"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "대시보드", icon: "grid" },
  { href: "/admin/reservations", label: "예약 관리", icon: "calendar" },
  { href: "/admin/customers", label: "고객", icon: "users" },
  { href: "/admin/chat", label: "채팅", icon: "chat" },
];

function Icon({ name }: { name: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 } as const;
  if (name === "grid")
    return (
      <svg {...common}>
        <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.8" />
        <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.8" />
        <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.8" />
        <rect x="13" y="13" width="7.5" height="7.5" rx="1.8" />
      </svg>
    );
  if (name === "calendar")
    return (
      <svg {...common}>
        <rect x="3.5" y="5" width="17" height="15" rx="2.2" />
        <path d="M8 3v4M16 3v4M3.5 10h17" strokeLinecap="round" />
      </svg>
    );
  if (name === "users")
    return (
      <svg {...common}>
        <circle cx="9" cy="8.5" r="3" />
        <path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" strokeLinecap="round" />
        <circle cx="17.5" cy="8.8" r="2.3" />
        <path d="M15.5 13.7c2.8.3 4.8 2.3 4.8 5.3" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M4 5h16v11H9l-4 4V5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function AdminSidebar({ businessName, pendingCount, chatCount }: { businessName: string; pendingCount: number; chatCount: number }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/business/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const badge: Record<string, number> = { "/admin/reservations": pendingCount, "/admin/chat": chatCount };

  return (
    <aside className="w-60 shrink-0 border-r border-ink-100 min-h-dvh flex flex-col bg-white">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-ink-100">
        <div className="w-8 h-8 rounded-xl bg-purple-500 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <circle cx="5.5" cy="9" r="2.3" />
            <circle cx="10.5" cy="5.5" r="2.3" />
            <circle cx="15.5" cy="5.5" r="2.3" />
            <circle cx="19" cy="10.5" r="2.1" />
            <path d="M12 11.2c-3 0-6.2 2.3-6.2 5.3 0 1.9 1.6 3.3 3.6 3.3 1.1 0 1.8-.4 2.6-.4s1.5.4 2.6.4c2 0 3.6-1.4 3.6-3.3 0-3-3.2-5.3-6.2-5.3z" />
          </svg>
        </div>
        <span className="font-extrabold text-[15px]">해피독 파트너</span>
      </div>

      <div className="px-4 pt-4 pb-2">
        <Link
          href="/"
          className="w-full flex items-center justify-between rounded-xl bg-ink-50 px-3.5 py-2.5 text-xs font-bold text-ink-500 hover:bg-ink-100 transition"
        >
          <span className="truncate">{businessName}</span>
          <span className="text-purple-600 whitespace-nowrap ml-2">↕ 고객 화면</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const count = badge[item.href];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-bold transition ${
                active ? "bg-purple-500/10 text-purple-700" : "text-ink-500 hover:bg-ink-50"
              }`}
            >
              <Icon name={item.icon} />
              <span className="flex-1">{item.label}</span>
              {!!count && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-500 text-white text-[11px] leading-5 text-center font-bold">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-ink-100">
        <button
          onClick={logout}
          className="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] font-bold text-ink-400 hover:bg-ink-50 transition"
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}
