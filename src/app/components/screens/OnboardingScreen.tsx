import { useState } from "react";
import { ArrowRight, Target, Bot, TrendingUp, Rocket, Sparkles } from "lucide-react";

interface Props {
  onNavigate: (screen: string) => void;
  userName?: string;
}

const FEATURES = [
  {
    icon: Target,
    color: "oklch(0.52 0.26 278)",
    bg: "oklch(0.95 0.06 278)",
    title: "Vježbaj argumentaciju",
    desc: "Odaberi temu i sagovornika, pa uvjeravaj AI koji te izaziva",
  },
  {
    icon: Bot,
    color: "oklch(0.46 0.18 196)",
    bg: "oklch(0.95 0.06 196)",
    title: "AI ti daje feedback",
    desc: "Dobij detaljnu analizu nakon svake vježbe — šta radiš dobro i gdje napreduješ",
  },
  {
    icon: TrendingUp,
    color: "oklch(0.50 0.17 145)",
    bg: "oklch(0.95 0.06 145)",
    title: "Prati napredak",
    desc: "Vidi kako rasteš kroz vrijeme uz grafove i značke dostignuća",
  },
];

export function OnboardingScreen({ onNavigate, userName }: Props) {
  const [step, setStep] = useState(0);
  const name = userName || (() => {
    try { return JSON.parse(localStorage.getItem("currentUser") ?? "{}").name || ""; } catch { return ""; }
  })();

  console.log("[Onboarding] currentStep:", step);

  const goNext = () => {
    if (step < 2) {
      setStep(s => s + 1);
    } else {
      localStorage.setItem("onboardingCompleted", "true");
      onNavigate("dashboard");
    }
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-6 pb-2 shrink-0">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-full transition-all duration-300"
            style={{
              width: i === step ? "24px" : "8px",
              height: "8px",
              background: i === step ? "oklch(0.52 0.26 278)" : "oklch(0.88 0.012 268)",
            }} />
        ))}
      </div>

      {/* Sliding container — track stays at parent width, each slide is flex: 0 0 100% */}
      <div className="flex-1 overflow-hidden">
        <div
          className="flex h-full"
          style={{
            transform: `translateX(-${step * 100}%)`,
            transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* STEP 0 — Welcome */}
          <div className="flex flex-col items-center justify-center px-7 text-center"
            style={{ flex: "0 0 100%" }}>
            <div className="w-28 h-28 rounded-3xl flex items-center justify-center mb-8"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", boxShadow: "0 16px 48px oklch(0.52 0.26 278 / 0.35)" }}>
              <Sparkles size={52} color="white" strokeWidth={1.5} />
            </div>
            <h1 className="text-foreground mb-3"
              style={{ fontSize: "28px", fontWeight: 800, lineHeight: 1.2 }}>
              Dobrodošli,<br />
              <span style={{ color: "oklch(0.52 0.26 278)" }}>{name || "korisniče"}!</span>
            </h1>
            <p className="text-muted-foreground" style={{ fontSize: "15px", lineHeight: 1.6 }}>
              Spremni ste da postanete majstor uvjeravanja?
            </p>
          </div>

          {/* STEP 1 — Features */}
          <div className="flex flex-col justify-center px-6"
            style={{ flex: "0 0 100%" }}>
            <h2 className="text-foreground text-center mb-6"
              style={{ fontSize: "24px", fontWeight: 700 }}>
              Kako funkcioniše?
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {FEATURES.map((f, i) => (
                <div key={i}
                  style={{ display: "flex", alignItems: "flex-start", gap: "16px", background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", borderRadius: "16px", padding: "16px", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <f.icon size={22} style={{ color: f.color }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "oklch(0.18 0.025 268)", marginBottom: "4px" }}>{f.title}</p>
                    <p style={{ fontSize: "12px", color: "oklch(0.55 0.04 268)", lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 2 — Ready */}
          <div className="flex flex-col items-center justify-center px-7 text-center"
            style={{ flex: "0 0 100%" }}>
            <div className="w-28 h-28 rounded-3xl flex items-center justify-center mb-8"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.16 55), oklch(0.44 0.18 65))", boxShadow: "0 16px 48px oklch(0.52 0.16 55 / 0.35)" }}>
              <Rocket size={52} color="white" strokeWidth={1.5} />
            </div>
            <h1 className="text-foreground mb-3"
              style={{ fontSize: "28px", fontWeight: 800 }}>
              Sve je spremno!
            </h1>
            <p className="text-muted-foreground" style={{ fontSize: "15px", lineHeight: 1.6 }}>
              Prva vježba te čeka.<br />Hajde da počnemo!
            </p>
          </div>
        </div>
      </div>

      {/* Bottom button */}
      <div className="px-6 pb-10 pt-4 shrink-0">
        <button
          onClick={goNext}
          disabled={false}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-white transition-all active:scale-[0.97]"
          style={{
            background: step === 2
              ? "linear-gradient(135deg, oklch(0.52 0.16 55), oklch(0.44 0.18 65))"
              : "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))",
            fontSize: "16px",
            fontWeight: 700,
            boxShadow: step === 2
              ? "0 6px 24px oklch(0.52 0.16 55 / 0.35)"
              : "0 6px 24px oklch(0.52 0.26 278 / 0.35)",
            transition: "background 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          {step === 2 ? (
            <>Počni vježbati <Rocket size={18} /></>
          ) : (
            <>Dalje <ArrowRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
}
