import { ArrowLeft, MessageCircle, Star } from "lucide-react";

interface Props { onNavigate: (screen: string) => void; }

export function AboutScreen({ onNavigate }: Props) {
  return (
    <div className="h-full flex flex-col px-5 py-4 bg-background overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <button onClick={() => onNavigate("splash")} className="self-start p-2 -ml-2 text-muted-foreground mb-4">
        <ArrowLeft size={20} />
      </button>

      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
          style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", boxShadow: "0 8px 32px oklch(0.52 0.26 278 / 0.28)" }}>
          <MessageCircle size={28} className="text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-foreground" style={{ fontSize: "24px", fontWeight: 700 }}>Persuasion Coach</h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>Verzija 2.1.0</p>
      </div>

      <div className="flex flex-col gap-4">
        {[
          { title: "Cilj aplikacije", color: "oklch(0.95 0.06 278)", body: "Persuasion Coach pomaže korisnicima svih nivoa da razviju i unaprijede komunikacijske i uvjeravačke vještine kroz interaktivne simulacije i personalizovani feedback." },
          { title: "AI tehnologija", color: "oklch(0.95 0.06 196)", body: "Koristimo naprednu AI koja simulira realne sagovornike — od skeptičnih kolega do autoritativnih figura — kako bi vježba bila što realnija." },
          { title: "Detaljna analiza", color: "oklch(0.96 0.06 55)", body: "Nakon svake sesije dobijate detaljnu analizu jasnoće, uvjerljivosti, tona i prilagodbe argumenta tipu sagovornika." },
          { title: "Gamifikacija", color: "oklch(0.95 0.06 145)", body: "Zarađujte značke, napredujte kroz nivoe i mjerite se s drugima." },
        ].map(s => (
          <div key={s.title} className="rounded-2xl p-4"
            style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
            <div className="w-2 h-2 rounded-full mb-2" style={{ background: s.color.replace("0.95", "0.52").replace("0.96", "0.52") }} />
            <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{s.title}</p>
            <p className="text-muted-foreground mt-1 leading-relaxed" style={{ fontSize: "13px" }}>{s.body}</p>
          </div>
        ))}

        <div className="flex items-center justify-center gap-1 mt-2">
          {[1,2,3,4].map(s => <Star key={s} size={16} fill="oklch(0.52 0.16 55)" style={{ color: "oklch(0.52 0.16 55)" }} />)}
          <Star size={16} style={{ color: "oklch(0.80 0.02 268)" }} />
          <span className="text-muted-foreground ml-2" style={{ fontSize: "13px" }}>4.8 / 5.0</span>
        </div>

        <button onClick={() => onNavigate("register")} className="w-full py-4 rounded-2xl text-white mt-2"
          style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "15px", fontWeight: 600, boxShadow: "0 4px 20px oklch(0.52 0.26 278 / 0.28)" }}>
          Počni besplatno
        </button>
      </div>
    </div>
  );
}
