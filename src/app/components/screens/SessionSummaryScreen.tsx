import { useState, useEffect } from "react";
import { BarChart2, Home, RefreshCw, CheckCircle2, Loader2 } from "lucide-react";
import { Star } from "lucide-react";

interface Props {
  onNavigate: (screen: string) => void;
  sessionId?: number | null;
}

const API = `http://${window.location.hostname}:8080/api`;
const authHdr = () => ({ "Authorization": `Bearer ${(sessionStorage.getItem("authToken") ?? localStorage.getItem("authToken")) ?? ""}` });

interface Analysis {
  persuasiveness?: number;
  argumentClarity?: number;
}

export function SessionSummaryScreen({ onNavigate, sessionId }: Props) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    fetch(`${API}/analysis/${sessionId}`, { headers: authHdr() })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data) { setAnalysis(data.data); return; }
        return fetch(`${API}/analysis/${sessionId}/generate`, {
          method: "POST",
          headers: { ...authHdr(), "Content-Type": "application/json" },
        }).then(r => r.ok ? r.json() : null).then(d => { if (d?.data) setAnalysis(d.data); });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  const persuasiveness = analysis?.persuasiveness ?? null;
  const argumentClarity = analysis?.argumentClarity ?? null;
  const hasData = persuasiveness !== null || argumentClarity !== null;
  const avgScore = hasData ? Math.round(((persuasiveness ?? 0) + (argumentClarity ?? 0)) / 2) : null;
  const stars = avgScore !== null ? Math.max(1, Math.round(avgScore / 20)) : 0;

  return (
    <div className="h-full flex flex-col px-5 py-4 bg-background overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="flex flex-col items-center pt-4 pb-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
          style={{ background: "oklch(0.95 0.06 278)" }}>
          <CheckCircle2 size={32} style={{ color: "oklch(0.52 0.26 278)" }} strokeWidth={1.5} />
        </div>
        <h1 className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>Vježba završena</h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>Sjajno odrađeno!</p>
      </div>

      <div className="rounded-2xl p-4 mb-5"
        style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
        <p className="text-muted-foreground mb-3"
          style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Brza ocjena
        </p>
        {loading ? (
          <div className="flex items-center justify-center py-5">
            <Loader2 size={22} className="animate-spin" style={{ color: "oklch(0.52 0.26 278)" }} />
          </div>
        ) : !sessionId || !hasData ? (
          <p className="text-muted-foreground text-center py-2" style={{ fontSize: "13px" }}>
            Nema podataka za ovu sesiju.
          </p>
        ) : (
          <>
            {[
              { label: "Uvjerljivost", val: persuasiveness ?? 0, color: "oklch(0.52 0.26 278)" },
              { label: "Jasnoća",      val: argumentClarity ?? 0, color: "oklch(0.46 0.18 196)" },
            ].map(m => (
              <div key={m.label} className="mb-3 last:mb-0">
                <div className="flex justify-between mb-1.5">
                  <span className="text-foreground" style={{ fontSize: "13px" }}>{m.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: m.color }}>{m.val}%</span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: "6px", background: "oklch(0.92 0.008 268)" }}>
                  <div className="h-full rounded-full" style={{ width: `${m.val}%`, background: m.color }} />
                </div>
              </div>
            ))}
            <div className="flex mt-3 gap-1 items-center">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={16}
                  fill={s <= stars ? "oklch(0.52 0.16 55)" : "none"}
                  style={{ color: s <= stars ? "oklch(0.52 0.16 55)" : "oklch(0.80 0.02 268)" }} />
              ))}
              <span className="text-muted-foreground ml-2" style={{ fontSize: "12px" }}>{stars}.0 / 5.0</span>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button onClick={() => onNavigate("analysis")}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-white transition-all active:opacity-80"
          style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "15px", fontWeight: 600, boxShadow: "0 4px 20px oklch(0.52 0.26 278 / 0.28)" }}>
          <BarChart2 size={18} /> Detaljna analiza
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onNavigate("select-topic")}
            className="py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:opacity-80"
            style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", fontSize: "14px", fontWeight: 600, color: "oklch(0.30 0.025 268)" }}>
            <RefreshCw size={16} /> Nova vježba
          </button>
          <button onClick={() => onNavigate("dashboard")}
            className="py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:opacity-80"
            style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", fontSize: "14px", fontWeight: 600, color: "oklch(0.30 0.025 268)" }}>
            <Home size={16} /> Početna
          </button>
        </div>
      </div>
    </div>
  );
}
