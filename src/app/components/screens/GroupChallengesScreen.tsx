import { Plus, Users, MessageCircle, ChevronRight, Clock, Trophy, Medal } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "../BottomNav";

interface Props { onNavigate: (screen: string) => void; }

const CHALLENGES = [
  { id: 1, title: "Tjedni debatni turnir", desc: "Debatirajte o temama iz svakodnevnog života", participants: 24, prize: "500 bodova", endDate: "3 dana", active: true, joined: true, color: "oklch(0.52 0.26 278)", bg: "oklch(0.95 0.06 278)" },
  { id: 2, title: "Prezentacijski maraton", desc: "30 prezentacija za 30 dana", participants: 12, prize: "Zlatna značka", endDate: "18 dana", active: true, joined: false, color: "oklch(0.52 0.16 55)", bg: "oklch(0.96 0.06 55)" },
  { id: 3, title: "Pregovaračka akademija", desc: "Simulacije poslovnih pregovaranja", participants: 8, prize: "Diamond status", endDate: "Završen", active: false, joined: true, color: "oklch(0.46 0.18 196)", bg: "oklch(0.95 0.06 196)" },
];

const LEADERBOARD = [
  { rank: 1, name: "Marko Petrović", score: 2840, avatar: "M", color: "oklch(0.52 0.16 55)" },
  { rank: 2, name: "Ana Kovač", score: 2710, avatar: "A", color: "oklch(0.52 0.26 278)", isMe: true },
  { rank: 3, name: "Ivan Horvat", score: 2590, avatar: "I", color: "oklch(0.46 0.18 196)" },
  { rank: 4, name: "Sara Begić", score: 2340, avatar: "S", color: "oklch(0.50 0.17 145)" },
  { rank: 5, name: "Luka Džambić", score: 2100, avatar: "L", color: "oklch(0.50 0.20 15)" },
];

export function GroupChallengesScreen({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<"active" | "leaderboard">("active");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <h2 className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>Grupni izazovi</h2>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", boxShadow: "0 2px 8px oklch(0.52 0.26 278 / 0.28)" }}>
            <Plus size={18} className="text-white" />
          </button>
        </div>

        <div className="flex gap-2 px-5 mb-4">
          {(["active", "leaderboard"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className="px-4 py-1.5 rounded-full transition-all"
              style={{ background: activeTab === t ? "oklch(0.52 0.26 278)" : "oklch(1 0 0)", border: `1px solid ${activeTab === t ? "oklch(0.52 0.26 278)" : "oklch(0.88 0.012 268)"}`, color: activeTab === t ? "white" : "oklch(0.52 0.04 268)", fontSize: "13px", fontWeight: activeTab === t ? 600 : 400 }}>
              {t === "active" ? "Izazovi" : "Rang lista"}
            </button>
          ))}
        </div>

        <div className="px-5">
          {activeTab === "active" ? (
            <div className="flex flex-col gap-3">
              {CHALLENGES.map(c => (
                <div key={c.id} className="rounded-2xl p-4" style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)", opacity: c.active ? 1 : 0.65 }}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full" style={{ background: c.active ? c.bg : "oklch(0.93 0.008 268)", color: c.active ? c.color : "oklch(0.55 0.04 268)", fontSize: "10px", fontWeight: 700 }}>
                          {c.active ? "AKTIVAN" : "ZAVRŠEN"}
                        </span>
                        {c.joined && <span className="px-2 py-0.5 rounded-full" style={{ background: "oklch(0.95 0.05 145)", color: "oklch(0.42 0.17 145)", fontSize: "10px", fontWeight: 600 }}>Član</span>}
                      </div>
                      <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>{c.title}</p>
                      <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>{c.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-muted-foreground" />
                      <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{c.participants}</span>
                    </div>
                    <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}><Clock size={10} />{c.endDate}</span>
                    <span style={{ fontSize: "11px", color: c.color, fontWeight: 600 }}>{c.prize}</span>
                  </div>
                  {c.active && (
                    <button className="mt-3 w-full py-2.5 rounded-xl transition-all"
                      style={{ background: c.joined ? "oklch(0.95 0.008 268)" : c.bg, border: c.joined ? "1px solid oklch(0.88 0.012 268)" : `1px solid ${c.color}50`, fontSize: "13px", fontWeight: 600, color: c.joined ? "oklch(0.35 0.025 268)" : c.color }}>
                      {c.joined ? "Pogledaj izazov" : "Prijavi se"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {LEADERBOARD.map(u => (
                <div key={u.rank} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: u.isMe ? "oklch(0.95 0.06 278)" : "oklch(1 0 0)", border: `1.5px solid ${u.isMe ? "oklch(0.75 0.14 278)" : "oklch(0.88 0.012 268)"}`, boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: u.rank === 1 ? "oklch(0.52 0.16 55)" : u.rank === 2 ? "oklch(0.55 0.04 268)" : u.rank === 3 ? "oklch(0.58 0.13 55)" : "oklch(0.65 0.04 268)", minWidth: "24px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {u.rank <= 3 ? <Trophy size={16} /> : u.rank}
                  </span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: u.color, fontSize: "13px", fontWeight: 700 }}>
                    {u.avatar}
                  </div>
                  <p className="flex-1 text-foreground" style={{ fontSize: "14px", fontWeight: u.isMe ? 700 : 400 }}>
                    {u.name} {u.isMe && <span className="text-primary" style={{ fontSize: "11px" }}>• Ti</span>}
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: u.rank === 1 ? "oklch(0.52 0.16 55)" : "oklch(0.52 0.04 268)" }}>{u.score.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mx-5 mt-4 rounded-2xl overflow-hidden mb-4" style={{ border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
          <button onClick={() => setChatOpen(!chatOpen)} className="w-full flex items-center justify-between px-4 py-3 bg-card">
            <div className="flex items-center gap-2">
              <MessageCircle size={16} style={{ color: "oklch(0.52 0.26 278)" }} />
              <span className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>Chat izazova</span>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" style={{ transform: chatOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          {chatOpen && (
            <div style={{ background: "oklch(0.97 0.004 268)" }}>
              <div className="px-4 py-3 flex flex-col gap-2" style={{ maxHeight: "140px", overflowY: "auto", scrollbarWidth: "none" }}>
                {[
                  { name: "Marko P.", msg: "Odlična vježba danas!", time: "10 min" },
                  { name: "Sara B.", msg: "Ko je spreman za večernju sesiju?", time: "5 min" },
                  { name: "Luka D.", msg: "Imam pitanje o scenariju 3", time: "2 min" },
                ].map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600, minWidth: "50px" }}>{m.name}</span>
                    <span className="text-foreground flex-1" style={{ fontSize: "12px" }}>{m.msg}</span>
                    <span className="text-muted-foreground" style={{ fontSize: "10px", minWidth: "25px" }}>{m.time}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 px-3 pb-3">
                <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Poruka..." className="flex-1 px-3 py-2 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none bg-white" style={{ border: "1px solid oklch(0.88 0.012 268)", fontSize: "12px" }} />
                <button className="px-3 rounded-xl text-white" style={{ background: "oklch(0.52 0.26 278)", fontSize: "12px", fontWeight: 600 }}>Pošalji</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNav current="group-challenges" onNavigate={onNavigate} />
    </div>
  );
}
