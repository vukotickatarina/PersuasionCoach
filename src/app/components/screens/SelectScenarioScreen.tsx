import { useState, useEffect } from "react";
import { ArrowLeft, Play, UserRound, HelpCircle, Users, Loader2 } from "lucide-react";
import { API } from "../../services/api";

interface Props {
  onNavigate: (screen: string) => void;
  mode?: "attacker" | "mentor" | "debate";
  topicId?: number | null;
  onSelectScenario?: (id: number) => void;
}

interface Scenario {
  id: number;
  title: string;
  description: string;
  topicTitle: string;
  interlocutorType: string;
  interlocutorProfile: string;
}

const DIFF_MAP: Record<string, { label: string; color: string; bg: string }> = {
  SKEPTICAL_FRIEND: { label: "Lagano",  color: "oklch(0.42 0.17 145)", bg: "oklch(0.94 0.06 145)" },
  STRANGER:         { label: "Lagano",  color: "oklch(0.42 0.17 145)", bg: "oklch(0.94 0.06 145)" },
  FRIEND:           { label: "Lagano",  color: "oklch(0.42 0.17 145)", bg: "oklch(0.94 0.06 145)" },
  PARENT:           { label: "Srednje", color: "oklch(0.52 0.16 55)",  bg: "oklch(0.96 0.06 55)"  },
  AUTHORITY:        { label: "Srednje", color: "oklch(0.52 0.16 55)",  bg: "oklch(0.96 0.06 55)"  },
  SKEPTIC:          { label: "Srednje", color: "oklch(0.52 0.16 55)",  bg: "oklch(0.96 0.06 55)"  },
  DEBATER:          { label: "Teško",   color: "oklch(0.50 0.20 15)",  bg: "oklch(0.96 0.06 15)"  },
  AUDIENCE:         { label: "Teško",   color: "oklch(0.50 0.20 15)",  bg: "oklch(0.96 0.06 15)"  },
};

const TYPE_LABEL: Record<string, string> = {
  SKEPTICAL_FRIEND: "Skeptični prijatelj",
  STRANGER:         "Stranac",
  FRIEND:           "Prijatelj",
  PARENT:           "Roditelj",
  AUTHORITY:        "Autoritet",
  SKEPTIC:          "Skeptik",
  DEBATER:          "Debater",
  AUDIENCE:         "Publika",
};

function IconForType({ type }: { type: string }) {
  if (type === "DEBATER" || type === "AUDIENCE") return <Users size={16} style={{ color: "oklch(0.52 0.26 278)" }} strokeWidth={1.5} />;
  if (type === "SKEPTICAL_FRIEND" || type === "SKEPTIC") return <HelpCircle size={16} style={{ color: "oklch(0.52 0.16 55)" }} strokeWidth={1.5} />;
  return <UserRound size={16} style={{ color: "oklch(0.50 0.20 15)" }} strokeWidth={1.5} />;
}

export function SelectScenarioScreen({ onNavigate, mode = "attacker", topicId, onSelectScenario }: Props) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    console.log("[SelectScenarioScreen] topicId =", topicId);
    if (!topicId) {
      setError("Tema nije odabrana. Idi nazad i odaberi temu.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setSelected(null);
    fetch(`${API}/topics/${topicId}/scenarios`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        const list: Scenario[] = data?.data ?? [];
        setScenarios(list.filter((s: Scenario) => s.id !== undefined));
        if (list.length === 0) setError("Nema scenarija za ovu temu.");
      })
      .catch(() => setError("Greška pri učitavanju scenarija."))
      .finally(() => setLoading(false));
  }, [topicId]);

  const selectedScenario = scenarios.find(s => s.id === selected);
  const topicTitle = scenarios[0]?.topicTitle ?? "";

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={() => onNavigate("select-topic")} className="p-2 -ml-2 text-muted-foreground"><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>Odaberi scenarij</h2>
            {mode === "mentor" && (
              <span className="px-1.5 py-0.5 rounded-md" style={{ background: "oklch(0.95 0.06 196)", color: "oklch(0.46 0.18 196)", fontSize: "9px", fontWeight: 700 }}>MENTOR</span>
            )}
          </div>
          <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{topicTitle || "Učitavanje..."}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-3" style={{ scrollbarWidth: "none" }}>
        {loading && (
          <div className="flex items-center justify-center pt-16 gap-2">
            <Loader2 size={20} className="text-muted-foreground animate-spin" />
            <p className="text-muted-foreground" style={{ fontSize: "14px" }}>Učitavanje scenarija...</p>
          </div>
        )}
        {!loading && error && (
          <p className="text-muted-foreground text-center pt-10" style={{ fontSize: "14px" }}>{error}</p>
        )}
        {!loading && !error && scenarios.map(s => {
          const diff = DIFF_MAP[s.interlocutorType] ?? { label: "Srednje", color: "oklch(0.52 0.16 55)", bg: "oklch(0.96 0.06 55)" };
          const isSelected = selected === s.id;
          return (
            <button key={s.id} onClick={() => setSelected(s.id === selected ? null : s.id)}
              className="rounded-2xl p-4 text-left transition-all"
              style={{ background: isSelected ? "oklch(0.95 0.06 278)" : "oklch(1 0 0)", border: `1.5px solid ${isSelected ? "oklch(0.65 0.18 278)" : "oklch(0.88 0.012 268)"}`, boxShadow: isSelected ? "0 0 0 3px oklch(0.52 0.26 278 / 0.12)" : "0 1px 4px oklch(0 0 0 / 0.04)" }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-3">
                  <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>{s.title}</p>
                  <p className="text-muted-foreground mt-1 leading-snug" style={{ fontSize: "12px" }}>{s.description}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: diff.bg, color: diff.color, fontSize: "10px", fontWeight: 600 }}>
                  {diff.label}
                </span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "oklch(0.95 0.008 268)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "oklch(0.96 0.06 15)" }}>
                  <IconForType type={s.interlocutorType} />
                </div>
                <div>
                  <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{TYPE_LABEL[s.interlocutorType] ?? s.interlocutorType}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Tip: {TYPE_LABEL[s.interlocutorType] ?? s.interlocutorType}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-5 pb-4 shrink-0">
        <button onClick={() => {
            if (!selected || !selectedScenario) return;
            onSelectScenario?.(selected);
            const dest = mode === "mentor" ? "conversation-mentor" : "conversation";
            onNavigate(dest);
          }}
          disabled={!selected}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
          style={{ background: selected ? "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))" : "oklch(0.92 0.008 268)", color: selected ? "white" : "oklch(0.65 0.04 268)", fontSize: "15px", fontWeight: 600, boxShadow: selected ? "0 4px 20px oklch(0.52 0.26 278 / 0.28)" : "none" }}>
          <Play size={18} /> {mode === "mentor" ? "Počni trening sa mentorom" : "Započni simulaciju"}
        </button>
      </div>
    </div>
  );
}
