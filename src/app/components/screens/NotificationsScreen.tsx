import { useState, useEffect } from "react";
import { ArrowLeft, Bell, Trophy, MessageCircle, Zap, Settings, Info, BarChart2 } from "lucide-react";

interface Props {
  onNavigate: (screen: string) => void;
  onOpenAnalysis?: (sessionId: number) => void;
}

const API = `http://${window.location.hostname}:8080/api`;
const authHdr = () => ({ "Authorization": `Bearer ${(sessionStorage.getItem("authToken") ?? localStorage.getItem("authToken")) ?? ""}` });

interface Notif {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const TYPE_STYLE: Record<string, { Icon: React.ElementType; color: string; bg: string }> = {
  BADGE:       { Icon: Trophy,        color: "oklch(0.52 0.16 55)",  bg: "oklch(0.96 0.06 55)"  },
  SESSION:     { Icon: MessageCircle, color: "oklch(0.46 0.18 196)", bg: "oklch(0.95 0.06 196)" },
  REMINDER:    { Icon: Bell,          color: "oklch(0.50 0.17 145)", bg: "oklch(0.95 0.06 145)" },
  ACHIEVEMENT: { Icon: Zap,           color: "oklch(0.52 0.26 278)", bg: "oklch(0.95 0.06 278)" },
  RESULT:      { Icon: BarChart2,     color: "oklch(0.46 0.18 196)", bg: "oklch(0.95 0.06 196)" },
  SYSTEM:      { Icon: Info,          color: "oklch(0.55 0.04 268)", bg: "oklch(0.94 0.008 268)"},
};
const DEFAULT_STYLE = { Icon: Bell, color: "oklch(0.55 0.04 268)", bg: "oklch(0.94 0.008 268)" };

function extractSessionId(message: string): number | null {
  const match = message.match(/#(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "Upravo";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  if (diff < 172800) return "Juče";
  return `${Math.floor(diff / 86400)} dana`;
}

export function NotificationsScreen({ onNavigate, onOpenAnalysis }: Props) {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/notifications`, { headers: authHdr() })
      .then(r => r.ok ? r.json() : null)
      .then(data => setNotifs(data?.data ?? []))
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: number) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await fetch(`${API}/notifications/${id}/read`, { method: "PATCH", headers: authHdr() }).catch(() => {});
  };

  const handleClick = (n: Notif) => {
    if (!n.read) markRead(n.id);
    if (n.message.includes('#') && onOpenAnalysis) {
      const sessionId = parseInt(n.message.split('#')[1]);
      if (!isNaN(sessionId)) onOpenAnalysis(sessionId);
    }
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={() => onNavigate("dashboard")} className="p-2 -ml-2 text-muted-foreground"><ArrowLeft size={20} /></button>
        <h2 className="text-foreground flex-1" style={{ fontSize: "18px", fontWeight: 700 }}>Obavještenja</h2>
        <button onClick={() => onNavigate("settings")} className="p-2 text-muted-foreground"><Settings size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-2 pb-4" style={{ scrollbarWidth: "none" }}>
        {!loading && notifs.length > 0 && (
          <p className="text-muted-foreground mb-1" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {unreadCount > 0 ? `${unreadCount} nepročitan${unreadCount === 1 ? "o" : "ih"}` : "Sve pročitano"}
          </p>
        )}

        {loading && (
          <p className="text-muted-foreground text-center pt-10" style={{ fontSize: "14px" }}>Učitavanje...</p>
        )}

        {!loading && notifs.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-16 gap-3">
            <Bell size={40} className="text-muted-foreground opacity-30" />
            <p className="text-muted-foreground text-center" style={{ fontSize: "14px" }}>Nemate obavještenja.</p>
          </div>
        )}

        {notifs.map(n => {
          const s = TYPE_STYLE[n.type] ?? DEFAULT_STYLE;
          const isClickable = !n.read || n.message.includes('#');
          return (
            <div key={n.id} onClick={() => handleClick(n)}
              className="flex items-start gap-3 rounded-2xl px-4 py-3.5 transition-all"
              style={{ background: n.read ? "oklch(0.98 0.004 268)" : "oklch(1 0 0)", border: `1px solid ${n.read ? "oklch(0.91 0.008 268)" : "oklch(0.88 0.012 268)"}`, boxShadow: n.read ? "none" : "0 1px 6px oklch(0 0 0 / 0.06)", cursor: isClickable ? "pointer" : "default" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: s.bg }}>
                <s.Icon size={18} style={{ color: s.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-foreground leading-snug" style={{ fontSize: "14px", fontWeight: n.read ? 400 : 600 }}>{n.title}</p>
                  <span className="text-muted-foreground shrink-0" style={{ fontSize: "10px", marginTop: "2px" }}>{fmtTime(n.createdAt)}</span>
                </div>
                <p className="text-muted-foreground mt-0.5 leading-snug" style={{ fontSize: "12px" }}>{n.message}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: "oklch(0.52 0.26 278)" }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
