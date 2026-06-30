import { ArrowLeft, Download, TrendingUp, Target, Clock, MessageCircle, Star, Award, Lightbulb } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from "recharts";

interface Props { onNavigate: (screen: string) => void; }

const RADAR = [
  { metric: "Jasnoća", value: 82 },
  { metric: "Uvjerljivost", value: 74 },
  { metric: "Ton", value: 68 },
  { metric: "Prilagodba", value: 79 },
  { metric: "Logika", value: 85 },
];
const TREND = [
  { week: "T1", avg: 58 }, { week: "T2", avg: 63 }, { week: "T3", avg: 60 },
  { week: "T4", avg: 71 }, { week: "T5", avg: 75 }, { week: "T6", avg: 78 },
];

export function ProgressReportScreen({ onNavigate }: Props) {
  const tt = { contentStyle: { background: "white", border: "1px solid oklch(0.88 0.012 268)", borderRadius: "8px", fontSize: "12px", color: "oklch(0.18 0.025 268)" } };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={() => onNavigate("progress")} className="p-2 -ml-2 text-muted-foreground"><ArrowLeft size={20} /></button>
        <h2 className="text-foreground flex-1" style={{ fontSize: "18px", fontWeight: 700 }}>Izvještaj o napretku</h2>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
          style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "12px", color: "white", fontWeight: 600 }}>
          <Download size={13} /> Preuzmi
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center justify-between mb-4 px-4 py-3 rounded-2xl"
          style={{ background: "oklch(0.95 0.06 278)", border: "1px solid oklch(0.80 0.12 278)" }}>
          <div>
            <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600, color: "oklch(0.42 0.24 278)" }}>Sedmični izvještaj</p>
            <p style={{ fontSize: "12px", color: "oklch(0.58 0.18 278)" }}>9. – 15. jun 2026.</p>
          </div>
          <Award size={24} style={{ color: "oklch(0.52 0.26 278)" }} strokeWidth={1.5} />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { icon: Target, label: "Vježbi ovaj tjedan", value: "5", sub: "+2 vs prošle sedmice", color: "oklch(0.52 0.26 278)", bg: "oklch(0.95 0.06 278)" },
            { icon: TrendingUp, label: "Prosječna ocjena", value: "76%", sub: "+8% rast", color: "oklch(0.42 0.17 145)", bg: "oklch(0.95 0.06 145)" },
            { icon: Clock, label: "Ukupno vrijeme", value: "38 min", sub: "Ovaj tjedan", color: "oklch(0.52 0.16 55)", bg: "oklch(0.96 0.06 55)" },
            { icon: MessageCircle, label: "Poruka razmjenjeno", value: "84", sub: "Kroz sve sesije", color: "oklch(0.46 0.18 196)", bg: "oklch(0.95 0.06 196)" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4"
              style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: s.bg }}>
                <s.icon size={16} style={{ color: s.color }} strokeWidth={1.5} />
              </div>
              <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>{s.value}</p>
              <p className="text-muted-foreground" style={{ fontSize: "11px", marginTop: "2px" }}>{s.label}</p>
              <p style={{ fontSize: "11px", color: s.color, fontWeight: 600, marginTop: "4px" }}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-4 mb-4"
          style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
          <p className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Trend napretka (6 tjedana)</p>
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={TREND}>
              <XAxis dataKey="week" tick={{ fill: "oklch(0.60 0.04 268)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tt} />
              <Line type="monotone" dataKey="avg" stroke="oklch(0.52 0.26 278)" strokeWidth={2.5} dot={{ fill: "oklch(0.52 0.26 278)", r: 4, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-4 mb-4"
          style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
          <p className="text-foreground mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>Profil vještina</p>
          <ResponsiveContainer width="100%" height={170}>
            <RadarChart data={RADAR}>
              <PolarGrid stroke="oklch(0.88 0.012 268)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "oklch(0.52 0.04 268)", fontSize: 10 }} />
              <Radar dataKey="value" stroke="oklch(0.52 0.26 278)" fill="oklch(0.52 0.26 278)" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-4 mb-4"
          style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
          <p className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Istaknute sesije</p>
          {[
            { label: "Najbolja sesija", scenario: "Predavanje pred publikom", score: 88, Icon: Award, color: "oklch(0.52 0.16 55)", bg: "oklch(0.96 0.06 55)" },
            { label: "Zahtjevna sesija", scenario: "Poslovna pregovaranja", score: 61, Icon: Target, color: "oklch(0.50 0.20 15)", bg: "oklch(0.96 0.06 15)" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 py-3"
              style={{ borderBottom: "1px solid oklch(0.93 0.008 268)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                <s.Icon size={18} style={{ color: s.color }} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
                <p className="text-foreground" style={{ fontSize: "13px" }}>{s.scenario}</p>
              </div>
              <span style={{ fontSize: "16px", fontWeight: 700, color: s.color }}>{s.score}%</span>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-3">
            <Star size={14} style={{ color: "oklch(0.52 0.16 55)" }} fill="oklch(0.52 0.16 55)" />
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Prosječna ocjena tjedna: <span className="text-foreground font-semibold">76%</span></p>
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: "oklch(0.95 0.06 278)", border: "1px solid oklch(0.80 0.12 278)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={15} style={{ color: "oklch(0.52 0.26 278)" }} strokeWidth={1.5} />
            <p style={{ fontSize: "13px", fontWeight: 700, color: "oklch(0.42 0.24 278)" }}>Preporuke za sljedeći tjedan</p>
          </div>
          {[
            "Fokusirajte se na scenarije s emocionalnom dimenzijom — tu imate prostor rasta",
            "Pokušajte koristiti tehniku zrcaljenja u narednim vježbama",
            "Odlični ste u logičkim argumentima — sada ih povežite s empatijom",
          ].map((r, i) => (
            <div key={i} className="flex gap-2 mb-2 last:mb-0">
              <span style={{ color: "oklch(0.52 0.26 278)", fontWeight: 700, fontSize: "14px" }}>–</span>
              <p style={{ fontSize: "13px", color: "oklch(0.38 0.16 278)" }}>{r}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
