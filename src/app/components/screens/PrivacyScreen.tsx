import { useState } from "react";
import { ArrowLeft, Shield, Eye, BarChart2, Share2, Check } from "lucide-react";

interface Props { onNavigate: (screen: string) => void; }

export function PrivacyScreen({ onNavigate }: Props) {
  const [settings, setSettings] = useState({
    publicProfile: false,
    shareStats: true,
    analytics: true,
    dataSharing: false,
    marketingEmails: false,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (k: keyof typeof settings) => setSettings(p => ({ ...p, [k]: !p[k] }));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <div onClick={onToggle} className="relative cursor-pointer transition-all shrink-0"
      style={{ width: "44px", height: "24px", borderRadius: "12px", background: on ? "oklch(0.52 0.26 278)" : "oklch(0.80 0.02 268)" }}>
      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
        style={{ left: on ? "calc(100% - 22px)" : "2px" }} />
    </div>
  );

  const rows = [
    { key: "publicProfile" as const, icon: Eye, title: "Javni profil", desc: "Drugi korisnici mogu vidjeti vaš profil i statistike" },
    { key: "shareStats" as const, icon: BarChart2, title: "Dijeli statistike", desc: "Prikazuj vaš napredak u rang listama" },
    { key: "analytics" as const, icon: BarChart2, title: "Analitika korišćenja", desc: "Pomažite nam poboljšati aplikaciju anonimnim podacima" },
    { key: "dataSharing" as const, icon: Share2, title: "Dijeljenje podataka", desc: "Dozvoli dijeljenje podataka s partnerima" },
    { key: "marketingEmails" as const, icon: Shield, title: "Marketing e-mailovi", desc: "Primajte e-mailove o novim funkcijama i ponudama" },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={() => onNavigate("settings")} className="p-2 -ml-2 text-muted-foreground"><ArrowLeft size={20} /></button>
        <h2 className="text-foreground flex-1" style={{ fontSize: "18px", fontWeight: 700 }}>Privatnost</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-start gap-3 rounded-2xl px-4 py-3.5 mb-5" style={{ background: "oklch(0.95 0.06 278)", border: "1px solid oklch(0.80 0.12 278)" }}>
          <Shield size={18} style={{ color: "oklch(0.42 0.22 278)", marginTop: "2px" }} />
          <p style={{ fontSize: "13px", color: "oklch(0.42 0.22 278)", lineHeight: 1.5 }}>
            Vaši podaci se obrađuju u skladu s našom Politikom privatnosti. Možete kontrolisati šta dijelite.
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {rows.map((r, i) => (
            <div key={r.key} className="flex items-center gap-3 rounded-2xl px-4 py-4"
              style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "oklch(0.95 0.008 268)" }}>
                <r.icon size={17} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{r.title}</p>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>{r.desc}</p>
              </div>
              <Toggle on={settings[r.key]} onToggle={() => toggle(r.key)} />
            </div>
          ))}
        </div>

        <button onClick={handleSave} className="w-full py-4 rounded-2xl text-white transition-all"
          style={{ background: saved ? "oklch(0.52 0.19 145)" : "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "15px", fontWeight: 600, boxShadow: "0 4px 20px oklch(0.52 0.26 278 / 0.25)" }}>
          {saved ? <><Check size={16} className="inline mr-1" />Sačuvano!</> : "Spremi podešavanja"}
        </button>

        <button className="w-full mt-3 py-3 rounded-2xl text-destructive transition-opacity active:opacity-70"
          style={{ background: "oklch(0.97 0.02 25)", border: "1px solid oklch(0.90 0.06 25)", fontSize: "14px", fontWeight: 500 }}>
          Izbriši sve moje podatke
        </button>
      </div>
    </div>
  );
}
