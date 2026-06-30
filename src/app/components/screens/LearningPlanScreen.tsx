import { useState, useEffect } from "react";
import { Loader2, Play, Heart, Target, Award, Users2, MessageSquare } from "lucide-react";
import { BottomNav } from "../BottomNav";

interface Props { onNavigate: (screen: string) => void; }

const API = `http://${window.location.hostname}:8080/api`;
const authHdr = () => ({ "Authorization": `Bearer ${(sessionStorage.getItem("authToken") ?? localStorage.getItem("authToken")) ?? ""}` });

interface Overview { skillLevels?: Record<string, number>; }

interface Recommendation {
  skill: string;
  title: string;
  description: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}

const SKILL_MAP: Record<string, Omit<Recommendation, "skill">> = {
  empatija: {
    title: "Razgovor s Roditeljem",
    description: "Vježbaj empatiju i aktivno slušanje kroz porodični dijalog. Nauči kako razumjeti tuđe emocije i izgraditi povjerenje.",
    Icon: Heart,
    color: "oklch(0.50 0.17 145)",
    bg: "oklch(0.95 0.06 145)",
    border: "oklch(0.78 0.12 145)",
  },
  argumentacija: {
    title: "Debata: Argumentacija",
    description: "Ojačaj vještinu argumentacije u direktnom sukobu mišljenja s iskusnim debaterom koji će dovesti u pitanje svaku tvrdnju.",
    Icon: Target,
    color: "oklch(0.50 0.20 15)",
    bg: "oklch(0.96 0.06 15)",
    border: "oklch(0.78 0.14 15)",
  },
  retorika: {
    title: "Uvjeravanje Autoriteta",
    description: "Unaprijedi rječitost i uvjerljivost govora. Vježbaj kako prezentovati ideje jasno i profesionalno pred zahtjevnom publikom.",
    Icon: Award,
    color: "oklch(0.52 0.26 278)",
    bg: "oklch(0.95 0.06 278)",
    border: "oklch(0.75 0.16 278)",
  },
  prilagodjenost: {
    title: "Uvjeravanje Prijatelja",
    description: "Razvij sposobnost prilagođavanja komunikacije različitim sagovornicima. Gradi povjerenje i nalazi zajednički jezik.",
    Icon: Users2,
    color: "oklch(0.46 0.18 196)",
    bg: "oklch(0.95 0.06 196)",
    border: "oklch(0.75 0.14 196)",
  },
  komunikacija: {
    title: "Razgovor sa Strancem",
    description: "Vježbaj samopouzdanu komunikaciju s nepoznatim osobama. Savladaj inicijalni neugodaj i brzo uspostavi kontakt.",
    Icon: MessageSquare,
    color: "oklch(0.50 0.04 268)",
    bg: "oklch(0.95 0.008 268)",
    border: "oklch(0.80 0.04 268)",
  },
};

function getRecommendations(skillLevels: Record<string, number>): Recommendation[] {
  const sorted = Object.entries(skillLevels)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3);

  return sorted.map(([skill]) => {
    const key = Object.keys(SKILL_MAP).find(k => skill.toLowerCase().includes(k) || k.includes(skill.toLowerCase()));
    const mapped = key ? SKILL_MAP[key] : SKILL_MAP.argumentacija;
    return { skill, ...mapped };
  });
}

export function LearningPlanScreen({ onNavigate }: Props) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/progress/overview`, { headers: authHdr() })
      .then(r => r.ok ? r.json() : null)
      .then(data => setOverview(data?.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const skillLevels = overview?.skillLevels ?? {};
  const hasSkills = Object.keys(skillLevels).length > 0;
  const recommendations = hasSkills ? getRecommendations(skillLevels) : [];

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="px-5 pt-4 pb-3">
          <h2 className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>Preporuke</h2>
          <p className="text-muted-foreground mt-0.5" style={{ fontSize: "13px" }}>
            Vježbe prilagođene tvojim najslabijim vještinama
          </p>
        </div>

        <div className="px-5 flex flex-col gap-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin" style={{ color: "oklch(0.52 0.26 278)" }} />
            </div>
          ) : !hasSkills ? (
            <div className="flex flex-col items-center justify-center py-14 gap-4 rounded-2xl"
              style={{ background: "oklch(0.97 0.004 268)", border: "1px solid oklch(0.88 0.012 268)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "oklch(0.93 0.008 268)" }}>
                <Target size={26} className="text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div className="text-center px-6">
                <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>
                  Nema preporuka još
                </p>
                <p className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: 1.5 }}>
                  Završite prvu vježbu da dobijete preporuke prilagođene vašem napretku.
                </p>
              </div>
              <button onClick={() => onNavigate("select-topic")}
                className="px-5 py-2.5 rounded-xl text-white"
                style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "13px", fontWeight: 600 }}>
                Počni prvu vježbu
              </button>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground"
                style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Preporučeno za tebe
              </p>
              {recommendations.map((rec, i) => (
                <div key={i} className="rounded-2xl overflow-hidden"
                  style={{ background: "oklch(1 0 0)", border: `1px solid oklch(0.88 0.012 268)`, boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
                  <div className="px-4 py-3 flex items-center gap-3"
                    style={{ background: rec.bg, borderBottom: `1px solid ${rec.border}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "oklch(1 0 0 / 0.55)" }}>
                      <rec.Icon size={20} style={{ color: rec.color }} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 700 }}>{rec.title}</p>
                      <p style={{ fontSize: "11px", color: rec.color, fontWeight: 500, textTransform: "capitalize" }}>
                        Slaba vještina: {rec.skill}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full"
                      style={{ background: "oklch(1 0 0 / 0.65)", color: rec.color, fontSize: "10px", fontWeight: 700 }}>
                      #{i + 1}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex items-end gap-3">
                    <p className="text-muted-foreground flex-1 leading-relaxed" style={{ fontSize: "13px" }}>
                      {rec.description}
                    </p>
                    <button onClick={() => onNavigate("select-topic")}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-white transition-all active:scale-95"
                      style={{ background: rec.color, fontSize: "12px", fontWeight: 600 }}>
                      <Play size={12} /> Započni
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
          <div className="h-2" />
        </div>
      </div>
      <BottomNav current="learning-plan" onNavigate={onNavigate} />
    </div>
  );
}
