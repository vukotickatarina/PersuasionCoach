import { ArrowLeft, Play, Loader2, Pencil, Heart, Briefcase, BookOpen, MessageCircle, Globe, Plus, Users, User, Zap, Swords, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

interface Props {
  onNavigate: (screen: string) => void;
  topicTitle: string;
  interlocutor: string;
  interlocutorLabel: string;
  mode: "attacker" | "mentor" | "debate";
  customContext?: string;
  onSessionStarted: (sessionId: number, initialMessages: { from: string; text: string }[]) => void;
}

interface IconInfo { Icon: LucideIcon; color: string; }

const TOPIC_ICONS: Record<string, IconInfo> = {
  "Zdravlje":          { Icon: Heart,         color: "#16a34a" },
  "Posao":             { Icon: Briefcase,      color: "#2563eb" },
  "Obrazovanje":       { Icon: BookOpen,       color: "#7c3aed" },
  "Lični stavovi":     { Icon: MessageCircle,  color: "#ea580c" },
  "Društvena pitanja": { Icon: Globe,          color: "#0891b2" },
};

const INTERLOCUTOR_ICONS: Record<string, IconInfo> = {
  "SKEPTICAL_FRIEND": { Icon: Users,     color: "#2563eb" },
  "PARENT":           { Icon: Heart,     color: "#16a34a" },
  "AUTHORITY":        { Icon: Briefcase, color: "#7c3aed" },
  "STRANGER":         { Icon: User,      color: "#6b7280" },
  "DEBATER":          { Icon: Zap,       color: "#dc2626" },
};

const MODE_INFO: Record<string, { label: string; Icon: LucideIcon; color: string }> = {
  attacker: { label: "Napadački mod", Icon: Swords,       color: "#dc2626" },
  mentor:   { label: "Savjetnik mod", Icon: GraduationCap, color: "#16a34a" },
  debate:   { label: "Dvoboj",        Icon: Swords,        color: "#dc2626" },
};

const MODE_API: Record<string, string> = {
  attacker: "ATTACK",
  mentor:   "MENTOR",
  debate:   "DEBATE",
};

export function ConfirmAndStartScreen({
  onNavigate,
  topicTitle,
  interlocutor, interlocutorLabel,
  mode, customContext,
  onSessionStarted,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const modeInfo = MODE_INFO[mode] ?? { label: mode, Icon: Play, color: "#6b7280" };

  const handleStart = async () => {
    setLoading(true);
    setError("");

    const requestBody = {
      topicTitle,
      interlocutorType: interlocutor,
      mode: MODE_API[mode] ?? mode.toUpperCase(),
      customContext: customContext || null,
    };

    console.log("[ConfirmAndStartScreen] POST /api/conversations/start", requestBody);

    try {
      const token = (sessionStorage.getItem("authToken") ?? localStorage.getItem("authToken")) ?? "";
      const res = await fetch(`http://${window.location.hostname}:8080/api/conversations/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      console.log("[ConfirmAndStartScreen] Response:", data);

      if (res.ok && data.data?.id) {
        const sessionId: number = data.data.id;
        const initialMessages: { from: string; text: string }[] =
          (data.data.messages ?? []).map((m: { content: string; sender: string }) => ({
            from: m.sender === "AI" ? "ai" : "user",
            text: m.content,
          }));
        onSessionStarted(sessionId, initialMessages);
        onNavigate(mode === "mentor" ? "conversation-mentor" : "conversation");
      } else {
        setError(data.message || `Greška ${res.status}: ${JSON.stringify(data)}`);
      }
    } catch (e) {
      console.error("[ConfirmAndStartScreen] Error:", e);
      setError("Greška pri povezivanju sa serverom.");
    } finally {
      setLoading(false);
    }
  };

  const EDIT_SCREEN = ["select-topic", "select-interlocutor", "select-mode"] as const;

  const topicIcon   = TOPIC_ICONS[topicTitle]       ?? { Icon: Plus,  color: "#6b7280" };
  const interlIcon  = INTERLOCUTOR_ICONS[interlocutor] ?? { Icon: User,  color: "#6b7280" };

  const summary = [
    { step: "O čemu?",         iconInfo: topicIcon,   value: topicTitle,        editTo: EDIT_SCREEN[0] },
    { step: "Sa kim?",         iconInfo: interlIcon,  value: interlocutorLabel, editTo: EDIT_SCREEN[1] },
    { step: "Kako se ponaša?", iconInfo: modeInfo,    value: modeInfo.label,    editTo: EDIT_SCREEN[2] },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={() => onNavigate("select-mode")} className="p-2 -ml-2 text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>Korak 4 od 4</p>
          <h2 className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>Kreni!</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-4" style={{ scrollbarWidth: "none" }}>
        <p className="text-muted-foreground" style={{ fontSize: "14px" }}>Pregled odabira</p>

        {summary.map(item => (
          <div key={item.step}
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ background: "oklch(1 0 0)", border: "1.5px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}
          >
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: item.iconInfo.color + "1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <item.iconInfo.Icon size={20} style={{ color: item.iconInfo.color }} strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-muted-foreground"
                style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {item.step}
              </p>
              <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>{item.value}</p>
            </div>
            <button
              onClick={() => onNavigate(item.editTo)}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-90"
              style={{ background: "oklch(0.94 0.008 268)", border: "1px solid oklch(0.88 0.012 268)" }}
              aria-label={`Uredi: ${item.step}`}
            >
              <Pencil size={15} className="text-muted-foreground" />
            </button>
          </div>
        ))}

        {customContext && (
          <div className="px-4 py-3 rounded-2xl"
            style={{ background: "oklch(0.96 0.04 278)", border: "1px solid oklch(0.85 0.10 278)" }}>
            <p className="text-muted-foreground"
              style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
              Vlastiti kontekst
            </p>
            <p style={{ fontSize: "13px", color: "oklch(0.38 0.16 278)" }}>{customContext}</p>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-xl"
            style={{ background: "oklch(0.97 0.02 25)", border: "1px solid oklch(0.88 0.08 25)" }}>
            <p style={{ color: "oklch(0.50 0.20 15)", fontSize: "13px" }}>{error}</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-6 shrink-0">
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))",
            color: "white", fontSize: "16px", fontWeight: 700,
            boxShadow: "0 4px 20px oklch(0.52 0.26 278 / 0.28)",
          }}
        >
          {loading
            ? <><Loader2 size={20} className="animate-spin" /> Pokrećem vježbu...</>
            : <><Play size={20} /> Započni vježbu</>
          }
        </button>
      </div>
    </div>
  );
}
