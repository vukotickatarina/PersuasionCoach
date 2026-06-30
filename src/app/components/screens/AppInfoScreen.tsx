import { ArrowLeft, MessageCircle, Star, Shield, Zap, BarChart2, Trophy } from "lucide-react";

interface Props { onNavigate: (screen: string) => void; }

export function AppInfoScreen({ onNavigate }: Props) {
  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={() => onNavigate("settings")} className="p-2 -ml-2 text-muted-foreground"><ArrowLeft size={20} /></button>
        <h2 className="text-foreground flex-1" style={{ fontSize: "18px", fontWeight: 700 }}>O aplikaciji</h2>
      </div>

      <div className="px-5 pb-6">
        <div className="flex flex-col items-center text-center mb-6 py-4">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-3"
            style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", boxShadow: "0 8px 32px oklch(0.52 0.26 278 / 0.28)" }}>
            <MessageCircle size={28} className="text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>Persuasion Coach</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-full"
              style={{ background: "oklch(0.95 0.06 145)", color: "oklch(0.42 0.17 145)", fontSize: "11px", fontWeight: 600 }}>v2.1.0</span>
            <span className="px-2 py-0.5 rounded-full"
              style={{ background: "oklch(0.95 0.06 278)", color: "oklch(0.42 0.24 278)", fontSize: "11px", fontWeight: 600 }}>Stabilna verzija</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {[1,2,3,4].map(s => <Star key={s} size={14} fill="oklch(0.52 0.16 55)" style={{ color: "oklch(0.52 0.16 55)" }} />)}
            <Star size={14} style={{ color: "oklch(0.80 0.02 268)" }} />
            <span className="text-muted-foreground ml-1" style={{ fontSize: "12px" }}>4.8 / 5.0 · 2.4k ocjena</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {[
            { icon: Zap, title: "Cilj aplikacije", color: "oklch(0.95 0.06 278)", iconColor: "oklch(0.52 0.26 278)", body: "Persuasion Coach pomaže korisnicima svih nivoa da razviju komunikacijske i uvjeravačke vještine kroz AI simulacije razgovora i personalizovani feedback." },
            { icon: MessageCircle, title: "AI tehnologija", color: "oklch(0.95 0.06 196)", iconColor: "oklch(0.46 0.18 196)", body: "Koristimo naprednu AI koja simulira realne sagovornike — od skeptičnih kolega do autoritativnih figura." },
            { icon: BarChart2, title: "Analitika", color: "oklch(0.96 0.06 55)", iconColor: "oklch(0.52 0.16 55)", body: "Detaljna analiza svake sesije: jasnoća, uvjerljivost, ton i emocionalna inteligencija." },
            { icon: Trophy, title: "Gamifikacija", color: "oklch(0.95 0.06 145)", iconColor: "oklch(0.50 0.17 145)", body: "Zarađujte značke, napredujte kroz nivoe i mjerite se s drugima." },
            { icon: Shield, title: "Sigurnost podataka", color: "oklch(0.97 0.02 25)", iconColor: "oklch(0.50 0.20 15)", body: "Svi vaši podaci su enkriptovani i sigurni. Nikad ne prodajemo vaše podatke trećim stranama." },
          ].map(s => (
            <div key={s.title} className="flex gap-3 rounded-2xl p-4"
              style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.color }}>
                <s.icon size={18} style={{ color: s.iconColor }} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{s.title}</p>
                <p className="text-muted-foreground mt-1 leading-relaxed" style={{ fontSize: "13px" }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-4" style={{ background: "oklch(0.97 0.004 268)", border: "1px solid oklch(0.88 0.012 268)" }}>
          <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Detalji verzije</p>
          {[
            ["Verzija", "2.1.0"],
            ["Build", "2024.12.15"],
            ["Platforma", "iOS / Android / Web"],
            ["Razvijač", "Persuasion Tech d.o.o."],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2" style={{ borderTop: "1px solid oklch(0.91 0.008 268)" }}>
              <span className="text-muted-foreground" style={{ fontSize: "13px" }}>{k}</span>
              <span className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
