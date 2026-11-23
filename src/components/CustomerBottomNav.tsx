"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CalendarIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.12 : 0} />
    <path d="M8 3v4M16 3v4M3.5 10h17" strokeLinecap="round" />
  </svg>
);
const ChatIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M4 5h16v11H9l-4 4V5Z" strokeLinejoin="round" />
  </svg>
);
const BellIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" strokeLinejoin="round" />
    <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
  </svg>
);
const UserIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="3.4" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.12 : 0} />
    <path d="M4.5 20c1.4-3.6 4.2-5.5 7.5-5.5s6.1 1.9 7.5 5.5" strokeLinecap="round" />
  </svg>
);

export function CustomerBottomNav({ chatUnread = 0 }: { chatUnread?: number }) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "홈", icon: HomeIcon },
    { href: "/reservations", label: "예약", icon: CalendarIcon },
    { href: "/chat", label: "채팅", icon: ChatIcon, badge: chatUnread },
    { href: "/notifications", label: "알림", icon: BellIcon },
    { href: "/mypage", label: "마이", icon: UserIcon },
  ];

  return (
    <nav className="sticky bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-ink-100 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 max-w-md mx-auto">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] relative ${
                active ? "text-brand-600 font-bold" : "text-ink-400"
              }`}
            >
              <span className="relative">
                <Icon active={active} />
                {!!item.badge && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-500 text-white text-[10px] leading-4 text-center font-bold">
                    {item.badge}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
