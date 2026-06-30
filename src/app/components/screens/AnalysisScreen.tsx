import { useState, useEffect } from "react";
import { ArrowLeft, Share2, ChevronRight, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

interface Props {
  onNavigate: (screen: string) => void;
  sessionId?: number | null;
}

interface FeedbackItem { id: number; type: "POSITIVE" | "IMPROVEMENT"; text: string; }
interface AnalysisData {
  argumentClarity?: number;
  persuasiveness?: number;
  interlocutorAdaptation?: number;
  logicScore?: number;
  feedbacks?: FeedbackItem[];
}

const API = `http://${window.location.hostname}:8080/api`;
const authHdr = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${(sessionStorage.getItem("authToken") ?? localStorage.getItem("authToken")) ?? ""}`,
});

const TONE_ITEMS = [
  { label: "Mirno",    pct: 45, color: "oklch(0.46 0.18 196)", bg: "oklch(0.95 0.06 196)" },
  { label: "Uvjereno", pct: 35, color: "oklch(0.52 0.26 278)", bg: "oklch(0.95 0.06 278)" },
  { label: "Empatično",pct: 20, color: "oklch(0.50 0.17 145)", bg: "oklch(0.95 0.06 145)" },
];

export function AnalysisScreen({ onNavigate, sessionId }: Props) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }

    const run = async () => {
      setLoading(true);
      try {
        // Generate (or fetch existing) full analysis first
        const genRes = await fetch(`${API}/analysis/${sessionId}/generate`, {
          method: "POST",
          headers: authHdr(),
        });
        if (genRes.ok) {
          const genData = await genRes.json();
          setAnalysis(genData.data ?? null);
          setLoading(false);
          return;
        }

        // Fallback: try GET analysis
        const getRes = await fetch(`${API}/analysis/${sessionId}`, { headers: authHdr() });
        if (getRes.ok) {
          const getData = await getRes.json();
          setAnalysis(getData.data ?? null);
          setLoading(false);
          return;
        }

        // Last resort: just feedback
        const fbRes = await fetch(`${API}/analysis/${sessionId}/feedback`, { headers: authHdr() });
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          setAnalysis({ feedbacks: fbData.data ?? [] });
        } else {
          setError("Analiza nije dostupna za ovu sesiju.");
        }
      } catch {
        setError("Greška pri učitavanju analize.");
      }
      setLoading(false);
    };
    run();
  }, [sessionId]);

  const positives = analysis?.feedbacks?.filter(f => f.type === "POSITIVE") ?? [];
  const improvements = analysis?.feedbacks?.filter(f => f.type === "IMPROVEMENT") ?? [];

  const metrics = [
    { label: "Jasnoća argumenata",      val: analysis?.argumentClarity ?? 0,       color: "oklch(0.46 0.18 196)" },
    { label: "Uvjerljivost",            val: analysis?.persuasiveness ?? 0,         color: "oklch(0.52 0.26 278)" },
    { label: "Ton i emocije",           val: 68,                                    color: "oklch(0.52 0.16 55)" },
    { label: "Prilagodba sagovorniku",  val: analysis?.interlocutorAdaptation ?? 0, color: "oklch(0.50 0.17 145)" },
  ];

  const radarData = [
    { metric: "Jasnoća",    value: analysis?.argumentClarity ?? 0 },
    { metric: "Uvjerljivost", value: analysis?.persuasiveness ?? 0 },
    { metric: "Ton",        value: 68 },
    { metric: "Prilagodba", value: analysis?.interlocutorAdaptation ?? 0 },
    { metric: "Logika",     value: analysis?.logicScore ?? 0 },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={() => onNavigate("session-summary")} className="p-2 -ml-2 text-muted-foreground"><ArrowLeft size={20} /></button>
        <h2 className="text-foreground flex-1" style={{ fontSize: "18px", fontWeight: 700 }}>Detaljna analiza</h2>
        <button className="p-2 text-muted-foreground"><Share2 size={18} /></button>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <Loader2 size={24} className="text-muted-foreground animate-spin" />
          <p className="text-muted-foreground" style={{ fontSize: "14px" }}>Generišem analizu...</p>
        </div>
      )}

      {!loading && (error || !sessionId) && (
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="text-center">
            <p className="text-muted-foreground" style={{ fontSize: "14px" }}>
              {error || "Završite vježbu da vidite analizu."}
            </p>
            <button onClick={() => onNavigate("select-topic")}
              className="mt-4 px-5 py-3 rounded-2xl text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "14px", fontWeight: 600 }}>
              Nova vježba
            </button>
          </div>
        </div>
      )}

      {!loading && !error && sessionId && (
        <div className="flex-1 overflow-y-auto px-5 pb-4" style={{ scrollbarWidth: "none" }}>
          {/* Radar */}
          <div className="rounded-2xl p-4 mb-4"
            style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
            <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Pregled vještina</p>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="oklch(0.88 0.012 268)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "oklch(0.52 0.04 268)", fontSize: 10 }} />
                <Radar dataKey="value" stroke="oklch(0.52 0.26 278)" fill="oklch(0.52 0.26 278)" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Metrike */}
          <div className="rounded-2xl p-4 mb-4"
            style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
            <p className="text-muted-foreground mb-3" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Metrike</p>
            <div className="flex flex-col gap-3">
              {metrics.map(m => (
                <div key={m.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-foreground" style={{ fontSize: "13px" }}>{m.label}</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: m.color }}>{m.val}%</span>
                  </div>
                  <div className="rounded-full overflow-hidden" style={{ height: "6px", background: "oklch(0.92 0.008 268)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${m.val}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ton */}
          <div className="rounded-2xl p-4 mb-4"
            style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
            <p className="text-muted-foreground mb-3" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Ton i emocije</p>
            <div className="flex gap-3">
              {TONE_ITEMS.map(e => (
                <div key={e.label} className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl" style={{ background: e.bg }}>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: e.color }}>{e.pct}%</span>
                  <span style={{ fontSize: "10px", color: e.color, fontWeight: 500 }}>{e.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Šta radiš dobro */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} style={{ color: "oklch(0.42 0.17 145)" }} />
              <p className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Šta radiš dobro</p>
            </div>
            <div className="flex flex-col gap-2">
              {positives.length === 0 ? (
                <div className="rounded-xl px-3 py-3" style={{ background: "oklch(0.97 0.008 268)", border: "1px solid oklch(0.90 0.012 268)" }}>
                  <p style={{ fontSize: "13px", color: "oklch(0.52 0.04 268)" }}>Završite više vježbi za personalizovane savjete.</p>
                </div>
              ) : positives.map(f => (
                <div key={f.id} className="flex gap-3 rounded-xl px-3 py-3"
                  style={{ background: "oklch(0.96 0.05 145)", border: "1px solid oklch(0.86 0.08 145)" }}>
                  <CheckCircle2 size={14} style={{ color: "oklch(0.42 0.17 145)", marginTop: "1px", flexShrink: 0 }} />
                  <p style={{ fontSize: "13px", color: "oklch(0.35 0.14 145)" }}>{f.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Šta može bolje */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} style={{ color: "oklch(0.52 0.16 55)" }} />
              <p className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Šta može bolje</p>
            </div>
            <div className="flex flex-col gap-2">
              {improvements.length === 0 ? (
                <div className="rounded-xl px-3 py-3" style={{ background: "oklch(0.97 0.008 268)", border: "1px solid oklch(0.90 0.012 268)" }}>
                  <p style={{ fontSize: "13px", color: "oklch(0.52 0.04 268)" }}>Nema preporuka za poboljšanje.</p>
                </div>
              ) : improvements.map(f => (
                <div key={f.id} className="flex gap-3 rounded-xl px-3 py-3"
                  style={{ background: "oklch(0.97 0.06 55)", border: "1px solid oklch(0.88 0.10 55)" }}>
                  <AlertTriangle size={14} style={{ color: "oklch(0.52 0.16 55)", marginTop: "1px", flexShrink: 0 }} />
                  <p style={{ fontSize: "13px", color: "oklch(0.44 0.14 55)" }}>{f.text}</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => onNavigate("select-topic")}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-white"
            style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "15px", fontWeight: 600, boxShadow: "0 4px 20px oklch(0.52 0.26 278 / 0.28)" }}>
            Nova vježba <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
