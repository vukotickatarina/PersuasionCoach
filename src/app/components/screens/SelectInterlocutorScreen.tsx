import { ArrowLeft, Check, Users, Heart, Briefcase, User, Zap, BookOpen, MessageCircle, Globe, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  onNavigate: (screen: string) => void;
  topicTitle: string;
  onSelectInterlocutor: (type: string) => void;
  currentInterlocutor?: string;
}

const TOPIC_ICONS: Record<string, { Icon: LucideIcon; color: string }> = {
  "Zdravlje":          { Icon: Heart,         color: "#16a34a" },
  "Posao":             { Icon: Briefcase,      color: "#2563eb" },
  "Obrazovanje":       { Icon: BookOpen,       color: "#7c3aed" },
  "Lični stavovi":     { Icon: MessageCircle,  color: "#ea580c" },
  "Društvena pitanja": { Icon: Globe,          color: "#0891b2" },
};

interface Interlocutor {
  id: string;
  label: string;
  Icon: LucideIcon;
  color: string;
}

const INTERLOCUTORS: Interlocutor[] = [
  { id: "SKEPTICAL_FRIEND", label: "Prijatelj", Icon: Users,    color: "#2563eb" },
  { id: "PARENT",           label: "Roditelj",  Icon: Heart,    color: "#16a34a" },
  { id: "AUTHORITY",        label: "Autoritet", Icon: Briefcase, color: "#7c3aed" },
  { id: "STRANGER",         label: "Stranac",   Icon: User,     color: "#6b7280" },
  { id: "DEBATER",          label: "Debater",   Icon: Zap,      color: "#dc2626" },
];

export function SelectInterlocutorScreen({
  onNavigate, topicTitle,
  onSelectInterlocutor, currentInterlocutor,
}: Props) {
  const topicIconInfo = TOPIC_ICONS[topicTitle] ?? { Icon: Plus, color: "#6b7280" };
  const TopicIcon = topicIconInfo.Icon;
  const handleSelect = (id: string) => {
    onSelectInterlocutor(id);
    onNavigate("select-mode");
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={() => onNavigate("select-topic")} className="p-2 -ml-2 text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>Korak 2 od 4</p>
          <h2 className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>Sa kim?</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl"
          style={{ background: "oklch(0.95 0.06 278)", border: "1px solid oklch(0.85 0.10 278)" }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: topicIconInfo.color + "25", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TopicIcon size={12} style={{ color: topicIconInfo.color }} strokeWidth={2} />
          </div>
          <p style={{ fontSize: "13px", color: "oklch(0.40 0.18 278)", fontWeight: 500 }}>{topicTitle}</p>
        </div>

        <p className="text-muted-foreground mb-4" style={{ fontSize: "14px" }}>Ko je tvoj sagovornik?</p>

        <div className="flex flex-col gap-3">
          {INTERLOCUTORS.map(({ id, label, Icon, color }) => {
            const isSelected = currentInterlocutor === id;
            return (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
                style={{
                  background: isSelected ? color + "0f" : "oklch(1 0 0)",
                  border: `1.5px solid ${isSelected ? color + "66" : "oklch(0.88 0.012 268)"}`,
                  boxShadow: isSelected ? `0 0 0 3px ${color}22` : "0 1px 4px oklch(0 0 0 / 0.04)",
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: color + "1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={20} style={{ color }} strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>{label}</p>
                </div>
                {isSelected
                  ? <Check size={18} style={{ color, flexShrink: 0 }} />
                  : <span className="text-muted-foreground shrink-0" style={{ fontSize: "18px" }}>›</span>
                }
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
