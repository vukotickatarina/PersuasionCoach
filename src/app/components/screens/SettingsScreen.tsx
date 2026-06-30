import { ArrowLeft, ChevronRight, Globe, HelpCircle, Info, Lock, Bell, Shield, Trash2, Mail } from "lucide-react";
import { useState } from "react";

interface Props { onNavigate: (screen: string) => void; }

const LANGUAGES = ["Bosanski", "English", "Srpski", "Hrvatski"];

export function SettingsScreen({ onNavigate }: Props) {
  const [notifTypes, setNotifTypes] = useState({ reminders: true, results: true, tips: false, system: true });
  const [lang, setLang] = useState("Bosanski");
  const [showLang, setShowLang] = useState(false);

  const toggle = (key: keyof typeof notifTypes) => setNotifTypes(p => ({ ...p, [key]: !p[key] }));

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <div onClick={onToggle} className="relative cursor-pointer transition-all shrink-0"
      style={{ width: "40px", height: "22px", borderRadius: "11px", background: on ? "oklch(0.52 0.26 278)" : "oklch(0.80 0.02 268)" }}>
      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all"
        style={{ left: on ? "calc(100% - 18px)" : "2px" }} />
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={() => onNavigate("dashboard")} className="p-2 -ml-2 text-muted-foreground"><ArrowLeft size={20} /></button>
        <h2 className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>Podešavanja</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4" style={{ scrollbarWidth: "none" }}>

        {/* Account */}
        <p className="text-muted-foreground mb-2 px-1" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Nalog</p>
        <div className="rounded-2xl overflow-hidden mb-5" style={{ border: "1px solid oklch(0.88 0.012 268)" }}>
          {[
            { icon: Mail, label: "Promjena e-maila", screen: "change-email" },
            { icon: Lock, label: "Promjena lozinke", screen: "change-password" },
          ].map((item, i, arr) => (
            <button key={item.label} onClick={() => onNavigate(item.screen)}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-card text-left"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid oklch(0.92 0.008 268)" : "none" }}>
              <item.icon size={17} className="text-muted-foreground" />
              <span className="flex-1 text-foreground" style={{ fontSize: "14px" }}>{item.label}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Notifications */}
        <p className="text-muted-foreground mb-2 px-1" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Notifikacije</p>
        <div className="rounded-2xl overflow-hidden mb-5" style={{ border: "1px solid oklch(0.88 0.012 268)" }}>
          {([
            { key: "reminders" as const, label: "Podsjetnici za vježbu" },
            { key: "results" as const, label: "Novi rezultati" },
            { key: "tips" as const, label: "Savjeti i preporuke" },
            { key: "system" as const, label: "Sistemska obavještenja" },
          ]).map((item, i, arr) => (
            <div key={item.key} className="flex items-center gap-3 px-4 py-3.5 bg-card"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid oklch(0.92 0.008 268)" : "none" }}>
              <Bell size={17} className="text-muted-foreground" />
              <span className="flex-1 text-foreground" style={{ fontSize: "14px" }}>{item.label}</span>
              <Toggle on={notifTypes[item.key]} onToggle={() => toggle(item.key)} />
            </div>
          ))}
        </div>

        {/* Privacy */}
        <p className="text-muted-foreground mb-2 px-1" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Privatnost</p>
        <div className="rounded-2xl overflow-hidden mb-5" style={{ border: "1px solid oklch(0.88 0.012 268)" }}>
          <button onClick={() => onNavigate("privacy")}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-card text-left">
            <Shield size={17} className="text-muted-foreground" />
            <span className="flex-1 text-foreground" style={{ fontSize: "14px" }}>Privatnost i dijeljenje podataka</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Language */}
        <p className="text-muted-foreground mb-2 px-1" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Jezik</p>
        <div className="rounded-2xl overflow-hidden mb-5" style={{ border: "1px solid oklch(0.88 0.012 268)" }}>
          <div className="px-4 py-3.5 bg-card">
            <button onClick={() => setShowLang(!showLang)} className="w-full flex items-center gap-3">
              <Globe size={17} className="text-muted-foreground" />
              <span className="flex-1 text-foreground text-left" style={{ fontSize: "14px" }}>Jezik aplikacije</span>
              <span className="text-muted-foreground" style={{ fontSize: "13px" }}>{lang}</span>
              <ChevronRight size={16} className="text-muted-foreground" style={{ transform: showLang ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            {showLang && (
              <div className="mt-3 flex flex-col gap-1">
                {LANGUAGES.map(l => (
                  <button key={l} onClick={() => { setLang(l); setShowLang(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all"
                    style={{ background: l === lang ? "oklch(0.95 0.06 278)" : "transparent" }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: l === lang ? "oklch(0.52 0.26 278)" : "oklch(0.78 0.02 268)" }} />
                    <span style={{ fontSize: "13px", color: l === lang ? "oklch(0.42 0.24 278)" : "oklch(0.52 0.04 268)", fontWeight: l === lang ? 600 : 400 }}>{l}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Support */}
        <p className="text-muted-foreground mb-2 px-1" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Podrška</p>
        <div className="rounded-2xl overflow-hidden mb-5" style={{ border: "1px solid oklch(0.88 0.012 268)" }}>
          {[
            { icon: HelpCircle, label: "FAQ i podrška", screen: "faq" },
            { icon: Info, label: "O aplikaciji · v2.1.0", screen: "app-info" },
            { icon: Info, label: "Uvjeti korišćenja", screen: "terms" },
          ].map((item, i, arr) => (
            <button key={item.label} onClick={() => onNavigate(item.screen)}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-card text-left"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid oklch(0.92 0.008 268)" : "none" }}>
              <item.icon size={17} className="text-muted-foreground" />
              <span className="flex-1 text-foreground" style={{ fontSize: "14px" }}>{item.label}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-destructive mb-2 transition-opacity active:opacity-70"
          style={{ background: "oklch(0.97 0.02 25)", border: "1px solid oklch(0.90 0.06 25)", fontSize: "14px", fontWeight: 500 }}>
          <Trash2 size={16} /> Izbriši nalog
        </button>
      </div>
    </div>
  );
}
