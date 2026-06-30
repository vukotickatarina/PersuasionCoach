import { useState, useEffect } from "react";
import { X, Award, Flame, Target, Zap, Trophy, MessageSquare, Star } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { BottomNav } from "../BottomNav";

interface Props { onNavigate: (screen: string) => void; }

const API = `http://${window.location.hostname}:8080/api`;
const authHdr = () => ({ "Authorization": `Bearer ${(sessionStorage.getItem("authToken") ?? localStorage.getItem("authToken")) ?? ""}` });

interface DayScore { day: string; score: number; }
interface Overview {
  timeline: DayScore[];
  byTopic: Record<string, number>;
  skillLevels: Record<string, number>;
  overallProgress: number;
}
interface Badge {
  id: number;
  name: string;
  description: string;
  condition: string;
  earned: boolean;
}

const BADGE_ICONS: Record<string, React.ElementType> = {
  "Prva vježba":   Star,
  "7-dnevni niz":  Flame,
  "Precizan":      Target,
  "10 vježbi":     Zap,
  "Pobjednik":     Trophy,
  "Debater":       MessageSquare,
};
const BADGE_COLORS = [
  { color: "oklch(0.52 0.16 55)",  bg: "oklch(0.96 0.06 55)"  },
  { color: "oklch(0.50 0.20 15)",  bg: "oklch(0.96 0.06 15)"  },
  { color: "oklch(0.46 0.18 196)", bg: "oklch(0.95 0.06 196)" },
  { color: "oklch(0.52 0.26 278)", bg: "oklch(0.95 0.06 278)" },
  { color: "oklch(0.50 0.17 145)", bg: "oklch(0.95 0.06 145)" },
  { color: "oklch(0.52 0.16 55)",  bg: "oklch(0.96 0.06 55)"  },
];

const SKILL_COLORS: Record<string, string> = {
  argumentacija: "oklch(0.52 0.26 278)",
  empatija:      "oklch(0.46 0.18 196)",
  retorika:      "oklch(0.52 0.16 55)",
  prilagodjenost:"oklch(0.50 0.17 145)",
};

const TABS = ["Sedmično", "Mjesečno", "Godišnje"];

export function ProgressScreen({ onNavigate }: Props) {
  const [tab, setTab] = useState(0);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [badgePopup, setBadgePopup] = useState<(Badge & { color: string; bg: string; Icon: React.ElementType }) | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/progress/overview`, { headers: authHdr() }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/users/me/badges`, { headers: authHdr() }).then(r => r.ok ? r.json() : null),
    ])
      .then(([ovRes, bdRes]) => {
        setOverview(ovRes?.data ?? null);
        setBadges(bdRes?.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const timelineData: DayScore[] = overview?.timeline?.length
    ? overview.timeline
    : [];

  const topicData = Object.entries(overview?.byTopic ?? {}).map(([topic, vj]) => ({ topic, vj }));

  const skillData = Object.entries(overview?.skillLevels ?? {}).map(([label, level]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    level,
    color: SKILL_COLORS[label.toLowerCase()] ?? "oklch(0.52 0.26 278)",
  }));

  const tt = { contentStyle: { background: "white", border: "1px solid oklch(0.88 0.012 268)", borderRadius: "8px", color: "oklch(0.18 0.025 268)", fontSize: "12px", boxShadow: "0 4px 12px oklch(0 0 0 / 0.08)" } };

  return (
    <div className="h-full flex flex-col bg-background">
      {badgePopup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setBadgePopup(null)}>
          <div className="w-full rounded-3xl p-6" style={{ background: "oklch(1 0 0)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: badgePopup.bg }}>
                  <badgePopup.Icon size={28} style={{ color: badgePopup.color }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>{badgePopup.name}</p>
                  <span className="px-2 py-0.5 rounded-full"
                    style={{ background: badgePopup.earned ? "oklch(0.95 0.06 145)" : "oklch(0.94 0.008 268)", color: badgePopup.earned ? "oklch(0.42 0.17 145)" : "oklch(0.52 0.04 268)", fontSize: "11px", fontWeight: 600 }}>
                    {badgePopup.earned ? "Osvojena" : "Nije osvojena"}
                  </span>
                </div>
              </div>
              <button onClick={() => setBadgePopup(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.93 0.008 268)" }}>
                <X size={15} className="text-muted-foreground" />
              </button>
            </div>
            <p className="text-foreground mb-3 leading-relaxed" style={{ fontSize: "14px" }}>{badgePopup.description}</p>
            <div className="rounded-xl px-3 py-2.5 mb-4" style={{ background: "oklch(0.96 0.008 268)" }}>
              <p className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Uvjet</p>
              <p className="text-foreground mt-0.5" style={{ fontSize: "13px" }}>{badgePopup.condition}</p>
            </div>
            {!badgePopup.earned && (
              <button onClick={() => { setBadgePopup(null); onNavigate("select-topic"); }}
                className="w-full py-3.5 rounded-2xl text-white"
                style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "14px", fontWeight: 600 }}>
                Počni vježbati
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="px-5 pt-4 pb-2">
          <h2 className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>Napredak</h2>
        </div>

        <div className="flex px-5 mb-4 gap-2">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} className="px-3.5 py-1.5 rounded-full transition-all"
              style={{ background: tab === i ? "oklch(0.52 0.26 278)" : "oklch(1 0 0)", border: `1px solid ${tab === i ? "oklch(0.52 0.26 278)" : "oklch(0.88 0.012 268)"}`, color: tab === i ? "white" : "oklch(0.52 0.04 268)", fontSize: "13px", fontWeight: tab === i ? 600 : 400 }}>
              {t}
            </button>
          ))}
        </div>

        <div className="px-5 flex flex-col gap-4">
          {/* Timeline chart */}
          <div className="rounded-2xl p-4" style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>Ukupni napredak</p>
              {!loading && (
                <span style={{ fontSize: "20px", fontWeight: 700, color: "oklch(0.52 0.26 278)" }}>
                  {Math.round(overview?.overallProgress ?? 0)}%
                </span>
              )}
            </div>
            {loading ? (
              <div style={{ height: 120 }} className="flex items-center justify-center">
                <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Učitavanje...</p>
              </div>
            ) : timelineData.length === 0 ? (
              <div style={{ height: 120 }} className="flex flex-col items-center justify-center gap-1">
                <p className="text-muted-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>0%</p>
                <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Završite prvu vježbu da vidite napredak.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.52 0.26 278)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="oklch(0.52 0.26 278)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: "oklch(0.60 0.04 268)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip {...tt} />
                  <Area type="monotone" dataKey="score" stroke="oklch(0.52 0.26 278)" fill="url(#grad)" strokeWidth={2} dot={{ fill: "oklch(0.52 0.26 278)", strokeWidth: 0, r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* By topic chart */}
          <div className="rounded-2xl p-4" style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
            <p className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Vježbe po temi</p>
            {loading ? (
              <div style={{ height: 110 }} className="flex items-center justify-center">
                <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Učitavanje...</p>
              </div>
            ) : topicData.length === 0 ? (
              <div style={{ height: 110 }} className="flex items-center justify-center">
                <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Završite prvu vježbu da vidite napredak.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={topicData} barSize={18}>
                  <XAxis dataKey="topic" tick={{ fill: "oklch(0.60 0.04 268)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip {...tt} />
                  <Bar dataKey="vj" fill="oklch(0.55 0.20 196)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Skill levels */}
          <div className="rounded-2xl p-4" style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
            <p className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Nivo vještina</p>
            {loading ? (
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Učitavanje...</p>
            ) : skillData.length === 0 ? (
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Završite prvu vježbu da vidite napredak.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {skillData.map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-foreground" style={{ fontSize: "13px" }}>{s.label}</span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: s.color }}>Nivo {s.level}</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="flex-1 rounded-full" style={{ height: "5px", background: i < s.level ? s.color : "oklch(0.90 0.008 268)" }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="rounded-2xl p-4" style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>Značke</p>
              {!loading && badges.length > 0 && (
                <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Tapni za detalje</p>
              )}
            </div>
            {loading ? (
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Učitavanje...</p>
            ) : badges.length === 0 ? (
              <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Nemate još značaka. Završite vježbu da zaradite prvu!</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {badges.map((b, idx) => {
                  const palette = BADGE_COLORS[idx % BADGE_COLORS.length];
                  const Icon = BADGE_ICONS[b.name] ?? Award;
                  return (
                    <button key={b.id}
                      onClick={() => setBadgePopup({ ...b, ...palette, Icon })}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all active:scale-95"
                      style={{ background: b.earned ? palette.bg : "oklch(0.96 0.004 268)", border: `1px solid ${b.earned ? "oklch(0.82 0.08 268)" : "oklch(0.88 0.012 268)"}`, opacity: b.earned ? 1 : 0.45 }}>
                      <Icon size={22} style={{ color: b.earned ? palette.color : "oklch(0.65 0.04 268)" }} strokeWidth={1.5} />
                      <span className="text-center px-1" style={{ fontSize: "10px", color: b.earned ? palette.color : "oklch(0.60 0.04 268)", fontWeight: b.earned ? 600 : 400 }}>{b.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="h-2" />
        </div>
      </div>
      <BottomNav current="progress" onNavigate={onNavigate} />
    </div>
  );
}
