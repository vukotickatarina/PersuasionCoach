import { Home, TrendingUp, Lightbulb, History, User } from "lucide-react";

const NAV_ITEMS = [
  { icon: Home,      label: "Početna",   screen: "dashboard" },
  { icon: TrendingUp, label: "Napredak", screen: "progress" },
  { icon: Lightbulb, label: "Za tebe", screen: "learning-plan" },
  { icon: History,   label: "Istorija",  screen: "conversation-history" },
  { icon: User,      label: "Profil",    screen: "profile" },
];

interface Props {
  current: string;
  onNavigate: (screen: string) => void;
}

export function BottomNav({ current, onNavigate }: Props) {
  return (
    <div
      className="flex items-center justify-around px-2 shrink-0"
      style={{
        height: "64px",
        background: "oklch(1 0 0)",
        borderTop: "1px solid oklch(0.88 0.012 268)",
      }}
    >
      {NAV_ITEMS.map(item => {
        const active = current === item.screen;
        return (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className="flex flex-col items-center gap-1 transition-all active:scale-95 flex-1"
            style={{ minWidth: 0 }}
          >
            <item.icon
              size={20}
              style={{ color: active ? "oklch(0.52 0.26 278)" : "oklch(0.65 0.04 268)", strokeWidth: active ? 2 : 1.5 }}
            />
            <span style={{ fontSize: "10px", fontWeight: active ? 600 : 400, color: active ? "oklch(0.52 0.26 278)" : "oklch(0.65 0.04 268)" }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
