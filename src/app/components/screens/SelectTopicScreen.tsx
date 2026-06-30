import { ArrowLeft, X, Check, Heart, Briefcase, BookOpen, MessageCircle, Globe, Plus, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

interface Props {
  onNavigate: (screen: string) => void;
  onSelectTopic: (topicTitle: string, customContext?: string) => void;
  onRealSituation: (personName: string, situation: string) => void;
  currentTopicTitle?: string;
}

interface Category {
  label: string;
  desc: string;
  Icon: LucideIcon;
  color: string;
}

const CATEGORIES: Category[] = [
  { label: "Zdravlje",          desc: "Ishrana, sport, mentalno zdravlje",   Icon: Heart,         color: "#16a34a" },
  { label: "Posao",             desc: "Karijera, plata, poslovni pregovori", Icon: Briefcase,     color: "#2563eb" },
  { label: "Obrazovanje",       desc: "Učenje, jezici, lični razvoj",        Icon: BookOpen,      color: "#7c3aed" },
  { label: "Lični stavovi",     desc: "Vrijednosti, odluke, životni izbori", Icon: MessageCircle, color: "#ea580c" },
  { label: "Društvena pitanja", desc: "Ekologija, politika, tehnologija",    Icon: Globe,         color: "#0891b2" },
];

export function SelectTopicScreen({ onNavigate, onSelectTopic, onRealSituation, currentTopicTitle }: Props) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [showRealModal, setShowRealModal] = useState(false);
  const [realSituation, setRealSituation] = useState("");
  const [realPersonName, setRealPersonName] = useState("");

  const handleSelect = (label: string) => {
    onSelectTopic(label);
    onNavigate("select-interlocutor");
  };

  const handleCustomSubmit = () => {
    if (!customTitle.trim()) return;
    onSelectTopic(customTitle.trim(), customDesc.trim() || undefined);
    setShowCustomModal(false);
    setCustomTitle("");
    setCustomDesc("");
    onNavigate("select-interlocutor");
  };

  const handleRealSubmit = () => {
    if (!realSituation.trim() || !realPersonName.trim()) return;
    onRealSituation(realPersonName.trim(), realSituation.trim());
    setShowRealModal(false);
    setRealSituation("");
    setRealPersonName("");
  };

  const realValid = realSituation.trim().length > 0 && realPersonName.trim().length > 0;

  return (
    <div className="h-full flex flex-col bg-background">
      {showRealModal && (
        <div className="absolute inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="w-full rounded-t-3xl p-5 pb-8" style={{ background: "oklch(1 0 0)" }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#f59e0b1a" }}>
                  <Sparkles size={15} style={{ color: "#f59e0b" }} strokeWidth={1.8} />
                </div>
                <h3 className="text-foreground" style={{ fontSize: "17px", fontWeight: 700 }}>Opiši svoju situaciju</h3>
              </div>
              <button onClick={() => setShowRealModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.93 0.008 268)" }}>
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-muted-foreground mb-1.5 block"
                  style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Opiši situaciju *
                </label>
                <textarea
                  value={realSituation}
                  onChange={e => setRealSituation(e.target.value)}
                  placeholder={"npr. Moj šef mi je odbio povišicu iako znam da firma dobro posluje. Želim ga ubjediti da zaslužujem više."}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none resize-none"
                  style={{ background: "oklch(0.97 0.005 268)", border: "1px solid oklch(0.88 0.012 268)", fontSize: "14px" }}
                  onFocus={e => (e.target.style.borderColor = "#f59e0b")}
                  onBlur={e => (e.target.style.borderColor = "oklch(0.88 0.012 268)")}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1.5 block"
                  style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Ime ili naziv osobe *
                </label>
                <input
                  type="text"
                  value={realPersonName}
                  onChange={e => setRealPersonName(e.target.value)}
                  placeholder="npr. Moj šef Marko"
                  className="w-full px-4 py-3 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none"
                  style={{ background: "oklch(0.97 0.005 268)", border: "1px solid oklch(0.88 0.012 268)", fontSize: "15px" }}
                  onFocus={e => (e.target.style.borderColor = "#f59e0b")}
                  onBlur={e => (e.target.style.borderColor = "oklch(0.88 0.012 268)")}
                  onKeyDown={e => e.key === "Enter" && handleRealSubmit()}
                />
              </div>
              <button
                onClick={handleRealSubmit}
                disabled={!realValid}
                className="w-full py-4 rounded-2xl mt-1 flex items-center justify-center gap-2"
                style={{
                  background: realValid ? "linear-gradient(135deg, #f59e0b, #d97706)" : "oklch(0.92 0.008 268)",
                  color: realValid ? "white" : "oklch(0.65 0.04 268)",
                  fontSize: "15px", fontWeight: 600,
                  boxShadow: realValid ? "0 4px 20px #f59e0b44" : "none",
                }}
              >
                Dalje →
              </button>
            </div>
          </div>
        </div>
      )}

      {showCustomModal && (
        <div className="absolute inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="w-full rounded-t-3xl p-5 pb-8" style={{ background: "oklch(1 0 0)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-foreground" style={{ fontSize: "17px", fontWeight: 700 }}>Vlastita tema</h3>
              <button onClick={() => setShowCustomModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.93 0.008 268)" }}>
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-muted-foreground mb-1.5 block"
                  style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Naziv teme *
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="npr. Motivacioni razgovor"
                  className="w-full px-4 py-3 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none"
                  style={{ background: "oklch(0.97 0.005 268)", border: "1px solid oklch(0.88 0.012 268)", fontSize: "15px" }}
                  onFocus={e => (e.target.style.borderColor = "oklch(0.52 0.26 278)")}
                  onBlur={e => (e.target.style.borderColor = "oklch(0.88 0.012 268)")}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1.5 block"
                  style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Opiši o čemu želiš razgovarati
                </label>
                <textarea
                  value={customDesc}
                  onChange={e => setCustomDesc(e.target.value)}
                  placeholder="Opiši situaciju ili šta želiš uvježbati..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none resize-none"
                  style={{ background: "oklch(0.97 0.005 268)", border: "1px solid oklch(0.88 0.012 268)", fontSize: "15px" }}
                  onFocus={e => (e.target.style.borderColor = "oklch(0.52 0.26 278)")}
                  onBlur={e => (e.target.style.borderColor = "oklch(0.88 0.012 268)")}
                />
              </div>
              <button
                onClick={handleCustomSubmit}
                className="w-full py-4 rounded-2xl mt-1"
                style={{
                  background: customTitle.trim()
                    ? "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))"
                    : "oklch(0.92 0.008 268)",
                  color: customTitle.trim() ? "white" : "oklch(0.65 0.04 268)",
                  fontSize: "15px", fontWeight: 600,
                  boxShadow: customTitle.trim() ? "0 4px 20px oklch(0.52 0.26 278 / 0.28)" : "none",
                }}
              >
                Nastavi
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={() => onNavigate("dashboard")} className="p-2 -ml-2 text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>Korak 1 od 4</p>
          <h2 className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>O čemu?</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4" style={{ scrollbarWidth: "none" }}>
        <p className="text-muted-foreground mb-4" style={{ fontSize: "14px" }}>Odaberi kategoriju teme za vježbu</p>
        <div className="flex flex-col gap-3">
          {CATEGORIES.map(cat => {
            const isSelected = currentTopicTitle === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => handleSelect(cat.label)}
                className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
                style={{
                  background: isSelected ? cat.color + "0f" : "oklch(1 0 0)",
                  border: `1.5px solid ${isSelected ? cat.color + "66" : "oklch(0.88 0.012 268)"}`,
                  boxShadow: isSelected ? `0 0 0 3px ${cat.color}22` : "0 1px 4px oklch(0 0 0 / 0.04)",
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: cat.color + "1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <cat.Icon size={20} style={{ color: cat.color }} strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>{cat.label}</p>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>{cat.desc}</p>
                </div>
                {isSelected
                  ? <Check size={18} style={{ color: cat.color, flexShrink: 0 }} />
                  : <span className="text-muted-foreground shrink-0" style={{ fontSize: "18px" }}>›</span>
                }
              </button>
            );
          })}

          <button
            onClick={() => setShowRealModal(true)}
            className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
            style={{
              background: currentTopicTitle?.startsWith("Stvarna situacija:") ? "#f59e0b0f" : "oklch(1 0 0)",
              border: `1.5px solid ${currentTopicTitle?.startsWith("Stvarna situacija:") ? "#f59e0b66" : "#f59e0b44"}`,
              boxShadow: currentTopicTitle?.startsWith("Stvarna situacija:") ? "0 0 0 3px #f59e0b22" : "0 1px 4px oklch(0 0 0 / 0.04)",
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f59e0b1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Sparkles size={20} style={{ color: "#f59e0b" }} strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>Stvarna situacija</p>
              <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>Opiši konkretnu situaciju iz života</p>
            </div>
            {currentTopicTitle?.startsWith("Stvarna situacija:")
              ? <Check size={18} style={{ color: "#f59e0b", flexShrink: 0 }} />
              : <span className="text-muted-foreground shrink-0" style={{ fontSize: "18px" }}>›</span>
            }
          </button>

          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
            style={{ background: "oklch(0.97 0.005 268)", border: "1.5px dashed oklch(0.78 0.012 268)" }}
          >
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#6b72801a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Plus size={20} style={{ color: "#6b7280" }} strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>Dodaj vlastitu</p>
              <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>Opiši svoju temu</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
