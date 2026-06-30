import { ArrowLeft, Swords, GraduationCap, Check } from "lucide-react";

interface Props {
  onNavigate: (screen: string) => void;
  onSelectMode: (mode: "attacker" | "mentor" | "debate") => void;
  topicTitle?: string;
  interlocutorLabel?: string;
  currentMode?: string;
}

const MODES = [
  {
    id: "attacker" as const,
    title: "Napadački mod",
    subtitle: "1:AI Dvoboj",
    desc: "Sagovornik dovodi u pitanje sve što kažeš. Vježbaj pod pritiskom i ojačaj argumentaciju.",
    icon: Swords,
    gradient: "linear-gradient(135deg, #dc2626, #b91c1c)",
    badge: "Dostupno",
  },
  {
    id: "mentor" as const,
    title: "Savjetnik mod",
    subtitle: "1:AI Trening",
    desc: "AI ti pomaže da bolje argumentuješ. Nakon svakog argumenta dobijaš feedback: šta je dobro i šta poboljšati.",
    icon: GraduationCap,
    gradient: "linear-gradient(135deg, #16a34a, #15803d)",
    badge: "Novi mod",
  },
];

export function SelectModeScreen({ onNavigate, onSelectMode, topicTitle, interlocutorLabel, currentMode }: Props) {
  const handleSelect = (modeId: "attacker" | "mentor") => {
    onSelectMode(modeId);
    onNavigate("confirm-start");
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={() => onNavigate("select-interlocutor")} className="p-2 -ml-2 text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>Korak 3 od 4</p>
          <h2 className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>Kako se ponaša?</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-4" style={{ scrollbarWidth: "none" }}>
        {(topicTitle || interlocutorLabel) && (
          <div className="flex items-center gap-2 flex-wrap">
            {topicTitle && (
              <span className="px-3 py-1.5 rounded-full"
                style={{ background: "oklch(0.95 0.06 278)", fontSize: "12px", color: "oklch(0.40 0.18 278)", fontWeight: 500 }}>
                {topicTitle}
              </span>
            )}
            {interlocutorLabel && (
              <span className="px-3 py-1.5 rounded-full"
                style={{ background: "oklch(0.95 0.06 278)", fontSize: "12px", color: "oklch(0.40 0.18 278)", fontWeight: 500 }}>
                {interlocutorLabel}
              </span>
            )}
          </div>
        )}

        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => handleSelect(mode.id)}
              className="rounded-2xl text-left transition-all active:scale-[0.98]"
              style={{
                background: "oklch(1 0 0)",
                border: `1.5px solid ${isSelected ? "oklch(0.65 0.18 278)" : "oklch(0.88 0.012 268)"}`,
                boxShadow: isSelected
                  ? "0 0 0 3px oklch(0.52 0.26 278 / 0.12)"
                  : "0 2px 8px oklch(0 0 0 / 0.06)",
                overflow: "hidden",
              }}
            >
              <div className="px-4 py-3 flex items-center gap-3" style={{ background: mode.gradient }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "oklch(1 0 0 / 0.18)" }}>
                  <Icon size={20} color="white" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>{mode.title}</p>
                  <p style={{ fontSize: "11px", color: "oklch(1 0 0 / 0.75)" }}>{mode.subtitle}</p>
                </div>
                {isSelected
                  ? <Check size={18} color="white" />
                  : (
                    <span className="px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: "oklch(1 0 0 / 0.22)", color: "white", fontSize: "10px", fontWeight: 600 }}>
                      {mode.badge}
                    </span>
                  )
                }
              </div>
              <div className="px-4 py-3">
                <p className="text-muted-foreground leading-relaxed" style={{ fontSize: "13px" }}>{mode.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
