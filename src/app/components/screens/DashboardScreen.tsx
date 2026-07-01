import { useState, useEffect } from "react";
import { Bell, LogOut, Zap, Target, TrendingUp, Swords, ChevronRight } from "lucide-react";
import { BottomNav } from "../BottomNav";
import { API } from "../../services/api";

interface Props {
  onNavigate: (screen: string) => void;
  user?: { id: number; name: string; email: string } | null;
}

interface Stats {
  totalSessions: number;
  weeklyProgressPercent: number;
  weeklyGoal: number;
  weeklyCompleted: number;
}

interface Notif { id: number; read: boolean; }

const QUOTES = [
  "Uvjeravanje nije manipulacija — to je vještina razumijevanja.",
  "Svaki veliki argument počinje dobrim slušanjem.",
  "Retorika je most između ideje i promjene.",
  "Ko zna da pita, zna i da uvjeri.",
  "Jak argument ne plaši — on osvjetljava.",
  "Samopouzdanje u govoru gradi se vježbom, ne srećom.",
  "Najmoćnije oružje je dobro postavljeno pitanje.",
];

const DAYS = ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"];
const MONTHS = ["januar", "februar", "mart", "april", "maj", "jun", "jul", "august", "septembar", "oktobar", "novembar", "decembar"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Dobro jutro";
  if (h < 18) return "Dobro popodne";
  return "Dobro veče";
}

function formatDate() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}.`;
}

function getDailyQuote() {
  const start = new Date(new Date().getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((Date.now() - start) / 86_400_000);
  return QUOTES[dayOfYear % QUOTES.length];
}

export function DashboardScreen({ onNavigate, user }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [notifs, setNotifs] = useState<Notif[]>([]);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken") ?? localStorage.getItem("authToken");
    if (!token) return;
    const h = { "Authorization": `Bearer ${token}` };
    fetch(`${API}/users/me/stats`, { headers: h })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.data) setStats(data.data); })
      .catch(() => {});
    fetch(`${API}/notifications`, { headers: h })
      .then(r => r.ok ? r.json() : null)
      .then(data => setNotifs(data?.data ?? []))
      .catch(() => {});
  }, []);

  const displayName = user?.name ?? "Korisnik";
  const totalSessions = stats?.totalSessions ?? 0;
  const progressPct = Math.round(stats?.weeklyProgressPercent ?? 0);
  const weeklyGoal = stats?.weeklyGoal ?? 7;
  const weeklyCompleted = stats?.weeklyCompleted ?? 0;
  const remaining = Math.max(0, weeklyGoal - weeklyCompleted);
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "none" }}>

        {/* HEADER */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>{getGreeting()},</p>
            <h1 className="text-foreground" style={{ fontSize: "22px", fontWeight: 700, lineHeight: 1.2 }}>{displayName}</h1>
            <p className="text-muted-foreground mt-1" style={{ fontSize: "12px" }}>{formatDate()}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => onNavigate("notifications")}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(0.95 0.008 268)", border: "1px solid oklch(0.88 0.012 268)" }}>
              <Bell size={18} className="text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute flex items-center justify-center rounded-full"
                  style={{
                    top: "-5px", right: "-5px",
                    minWidth: "16px", height: "16px",
                    background: "oklch(0.55 0.22 25)",
                    fontSize: "9px", fontWeight: 700, color: "white",
                    padding: "0 3px",
                  }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => onNavigate("splash")}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(0.95 0.008 268)", border: "1px solid oklch(0.88 0.012 268)" }}>
              <LogOut size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* DAILY QUOTE */}
        <div className="rounded-2xl px-4 py-3 mb-5"
          style={{ background: "linear-gradient(135deg, oklch(0.96 0.04 278), oklch(0.97 0.03 290))", border: "1px solid oklch(0.90 0.06 278)" }}>
          <p style={{ fontSize: "12px", color: "oklch(0.44 0.22 278)", fontStyle: "italic", lineHeight: 1.6 }}>
            „{getDailyQuote()}"
          </p>
        </div>

        {/* STATISTIKE */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {[
            { label: "Vježbe", value: String(totalSessions), icon: Target, color: "oklch(0.46 0.18 196)", bg: "oklch(0.95 0.06 196)" },
            { label: "Napredak", value: `${progressPct}%`, icon: TrendingUp, color: "oklch(0.50 0.17 145)", bg: "oklch(0.95 0.06 145)" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 flex flex-col gap-2"
              style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon size={14} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>{s.value}</p>
                <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* SEDMIČNI CILJ */}
        <div className="rounded-2xl p-4 mb-5"
          style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>Sedmični cilj</p>
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{weeklyCompleted} / {weeklyGoal} vježbi</p>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: "8px", background: "oklch(0.92 0.008 268)" }}>
            <div className="h-full rounded-full"
              style={{ width: `${Math.min(100, progressPct)}%`, background: "linear-gradient(90deg, oklch(0.52 0.26 278), oklch(0.55 0.20 196))" }} />
          </div>
          <p className="text-muted-foreground mt-2" style={{ fontSize: "11px" }}>
            {remaining > 0 ? `Još ${remaining} vježb${remaining === 1 ? "a" : "e"} do cilja` : "Sedmični cilj ostvaren!"}
          </p>
        </div>

        {/* BRZI PRISTUP */}
        <p className="text-muted-foreground mb-3"
          style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Brzi pristup</p>

        <div className="flex flex-col gap-2.5">
          {[
            {
              screen: "select-topic",
              icon: Zap,
              iconColor: "oklch(0.52 0.26 278)",
              iconBg: "oklch(0.95 0.06 278)",
              label: "Vježbaj sada",
              sub: "Odaberi temu i mod",
            },
            {
              screen: "debate",
              icon: Swords,
              iconColor: "oklch(0.50 0.20 15)",
              iconBg: "oklch(0.96 0.06 15)",
              label: "1:1 Dvoboj",
              sub: "Debatuj sa AI",
            },
          ].map(a => (
            <button key={a.screen} onClick={() => onNavigate(a.screen)}
              className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all active:scale-[0.98]"
              style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 2px 8px oklch(0 0 0 / 0.06)" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: a.iconBg }}>
                <a.icon size={22} style={{ color: a.iconColor }} strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{a.label}</p>
                <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{a.sub}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>

        <div className="h-4" />
      </div>
      <BottomNav current="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
