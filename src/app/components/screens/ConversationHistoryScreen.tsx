import { useState, useEffect } from "react";
import { ArrowLeft, MessageCircle, ChevronRight, Search, UserRound, Users } from "lucide-react";
import { BottomNav } from "../BottomNav";

interface Props { onNavigate: (screen: string) => void; onOpenAnalysis?: (sessionId: number) => void; }

const API = `http://${window.location.hostname}:8080/api`;
const authHdr = () => ({ "Authorization": `Bearer ${(sessionStorage.getItem("authToken") ?? localStorage.getItem("authToken")) ?? ""}` });

interface Session {
  id: number;
  scenario: { title: string; topicTitle: string; interlocutorType: string } | null;
  startedAt: string;
  durationSeconds: number | null;
  messageCount: number;
  status: string;
  mode?: string;
  debateTopic?: string;
}
interface Msg { content: string; sender: string; }

function fmtDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86_400_000) return "Danas, " + d.toLocaleTimeString("bs", { hour: "2-digit", minute: "2-digit" });
  if (diff < 172_800_000) return "Juče, " + d.toLocaleTimeString("bs", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("bs", { day: "numeric", month: "short" }) + ", " +
    d.toLocaleTimeString("bs", { hour: "2-digit", minute: "2-digit" });
}
function fmtDur(s: number | null) {
  if (!s) return "--:--";
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function ConversationHistoryScreen({ onNavigate, onOpenAnalysis }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  useEffect(() => {
    fetch(`${API}/conversations/history`, { headers: authHdr() })
      .then(r => r.ok ? r.json() : null)
      .then(data => setSessions(data?.data ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const openSession = async (s: Session) => {
    setSelectedSession(s);
    setMessages([]);
    setLoadingMsgs(true);
    try {
      const r = await fetch(`${API}/conversations/${s.id}`, { headers: authHdr() });
      const data = await r.json();
      setMessages(data?.data?.messages ?? []);
    } catch { setMessages([]); }
    finally { setLoadingMsgs(false); }
  };

  const sessionTitle = (s: Session) =>
    s.mode === "DEBATE" ? (s.debateTopic ?? "Dvoboj") : (s.scenario?.title ?? "—");
  const sessionSubtitle = (s: Session) =>
    s.mode === "DEBATE" ? "Dvoboj (1:1)" : (s.scenario?.topicTitle ?? "—");

  const filtered = sessions.filter(s =>
    sessionTitle(s).toLowerCase().includes(search.toLowerCase()) ||
    sessionSubtitle(s).toLowerCase().includes(search.toLowerCase())
  );

  if (selectedSession) {
    const isDebate = selectedSession.mode === "DEBATE";
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0"
          style={{ borderBottom: "1px solid oklch(0.88 0.012 268)" }}>
          <button onClick={() => setSelectedSession(null)} className="p-2 -ml-2 text-muted-foreground"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: isDebate ? "oklch(0.95 0.06 278)" : "oklch(0.96 0.06 15)" }}>
              {isDebate
                ? <Users size={18} style={{ color: "oklch(0.52 0.26 278)" }} strokeWidth={1.5} />
                : <UserRound size={18} style={{ color: "oklch(0.50 0.20 15)" }} strokeWidth={1.5} />}
            </div>
            <div>
              <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
                {sessionTitle(selectedSession)}
              </p>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                {sessionSubtitle(selectedSession)} · {fmtDate(selectedSession.startedAt)}
              </p>
            </div>
          </div>
          {isDebate
            ? <span className="px-2 py-1 rounded-lg" style={{ background: "oklch(0.95 0.06 278)", color: "oklch(0.42 0.24 278)", fontSize: "10px", fontWeight: 700 }}>DVOBOJ</span>
            : <span className="px-2 py-1 rounded-lg text-muted-foreground" style={{ background: "oklch(0.93 0.008 268)", fontSize: "11px" }}>{selectedSession.messageCount} poruka</span>
          }
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
          style={{ scrollbarWidth: "none", background: "oklch(0.97 0.004 268)" }}>
          {isDebate && (
            <div className="text-center pt-10 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "oklch(0.95 0.06 278)" }}>
                <Users size={28} style={{ color: "oklch(0.52 0.26 278)" }} />
              </div>
              <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>Dvoboj sesija</p>
              <p className="text-muted-foreground text-center" style={{ fontSize: "13px", maxWidth: "240px" }}>
                Poruke dvoboja se ne prikazuju ovdje. Rezultati su dostupni na ekranu debate.
              </p>
            </div>
          )}
          {!isDebate && loadingMsgs && (
            <p className="text-muted-foreground text-center pt-10" style={{ fontSize: "13px" }}>Učitavanje...</p>
          )}
          {!isDebate && !loadingMsgs && messages.length === 0 && (
            <p className="text-muted-foreground text-center pt-10" style={{ fontSize: "13px" }}>Nema poruka u ovoj sesiji.</p>
          )}
          {!isDebate && messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === "USER" ? "justify-end" : "justify-start"}`}>
              {m.sender === "AI" && (
                <div className="mr-2 mt-1 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "oklch(0.96 0.06 15)" }}>
                  <UserRound size={14} style={{ color: "oklch(0.50 0.20 15)" }} strokeWidth={1.5} />
                </div>
              )}
              <div className="max-w-[78%] px-4 py-3 leading-snug"
                style={{ background: m.sender === "USER" ? "oklch(0.52 0.26 278)" : "oklch(1 0 0)", color: m.sender === "USER" ? "white" : "oklch(0.18 0.025 268)", fontSize: "14px", borderRadius: m.sender === "USER" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", boxShadow: "0 1px 4px oklch(0 0 0 / 0.06)" }}>
                {m.content}
              </div>
            </div>
          ))}
          {!isDebate && !loadingMsgs && messages.length > 0 && (
            <div className="flex justify-center py-2">
              <span className="px-3 py-1 rounded-full text-muted-foreground"
                style={{ background: "oklch(0.90 0.008 268)", fontSize: "11px" }}>
                Kraj razgovora · {fmtDur(selectedSession.durationSeconds)}
              </span>
            </div>
          )}
        </div>

        {!isDebate && (
          <div className="px-5 py-3 shrink-0" style={{ borderTop: "1px solid oklch(0.88 0.012 268)" }}>
            <button onClick={() => onOpenAnalysis ? onOpenAnalysis(selectedSession.id) : onNavigate("analysis")}
              className="w-full py-3.5 rounded-2xl text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "14px", fontWeight: 600 }}>
              Pogledaj analizu ovog razgovora
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={() => onNavigate("dashboard")} className="p-2 -ml-2 text-muted-foreground"><ArrowLeft size={20} /></button>
        <h2 className="text-foreground flex-1" style={{ fontSize: "18px", fontWeight: 700 }}>Istorija razgovora</h2>
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "oklch(0.95 0.06 278)" }}>
          <MessageCircle size={14} style={{ color: "oklch(0.52 0.26 278)" }} />
        </div>
      </div>

      <div className="px-5 mb-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)" }}>
          <Search size={15} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pretraži razgovore..."
            className="flex-1 bg-transparent text-foreground placeholder-muted-foreground/50 outline-none"
            style={{ fontSize: "14px" }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-3" style={{ scrollbarWidth: "none" }}>
        {loading && (
          <p className="text-muted-foreground text-center pt-10" style={{ fontSize: "14px" }}>Učitavanje...</p>
        )}
        {!loading && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-16 gap-3">
            <MessageCircle size={40} className="text-muted-foreground opacity-30" />
            <p className="text-muted-foreground text-center" style={{ fontSize: "14px" }}>Nemate još razgovora.</p>
            <button onClick={() => onNavigate("select-topic")} className="px-4 py-2 rounded-xl text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "13px", fontWeight: 600 }}>
              Počni prvu vježbu
            </button>
          </div>
        )}
        {!loading && sessions.length > 0 && filtered.length === 0 && (
          <p className="text-muted-foreground text-center pt-10" style={{ fontSize: "14px" }}>Nema rezultata za "{search}"</p>
        )}
        {filtered.map(s => {
          const isDebate = s.mode === "DEBATE";
          return (
            <button key={s.id} onClick={() => openSession(s)}
              className="w-full rounded-2xl p-4 text-left transition-all active:scale-98"
              style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: isDebate ? "oklch(0.95 0.06 278)" : "oklch(0.96 0.06 15)" }}>
                  {isDebate
                    ? <Users size={20} style={{ color: "oklch(0.52 0.26 278)" }} strokeWidth={1.5} />
                    : <UserRound size={20} style={{ color: "oklch(0.50 0.20 15)" }} strokeWidth={1.5} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <p className="text-foreground truncate" style={{ fontSize: "14px", fontWeight: 600 }}>
                        {sessionTitle(s)}
                      </p>
                      {isDebate && (
                        <span className="px-1.5 py-0.5 rounded-md shrink-0"
                          style={{ background: "oklch(0.95 0.06 278)", color: "oklch(0.42 0.24 278)", fontSize: "9px", fontWeight: 700 }}>
                          DVOBOJ
                        </span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-lg shrink-0" style={{
                      background:
                        s.status === "COMPLETED" ? "oklch(0.94 0.06 145)" :
                        s.status === "PAUSED"    ? "oklch(0.96 0.06 55)"  :
                                                   "oklch(0.95 0.06 278)",
                      color:
                        s.status === "COMPLETED" ? "oklch(0.42 0.17 145)" :
                        s.status === "PAUSED"    ? "oklch(0.52 0.16 55)"  :
                                                   "oklch(0.42 0.24 278)",
                      fontSize: "10px", fontWeight: 600,
                    }}>
                      {s.status === "COMPLETED" ? "Završeno" : s.status === "PAUSED" ? "Pauzirano" : "U toku"}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>{sessionSubtitle(s)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{fmtDur(s.durationSeconds)}</span>
                    {!isDebate && <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{s.messageCount} poruka</span>}
                    <span className="text-muted-foreground ml-auto" style={{ fontSize: "11px" }}>{fmtDate(s.startedAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end mt-2">
                <span className="text-primary flex items-center gap-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                  {isDebate ? "Pogledaj detalje" : "Pogledaj razgovor"} <ChevronRight size={13} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <BottomNav current="conversation-history" onNavigate={onNavigate} />
    </div>
  );
}
