import { ArrowLeft, Camera, Bell, Lock, ChevronRight, LogOut, Shield, Sprout, Flame, Zap, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { BottomNav } from "../BottomNav";

interface CurrentUser { id: number; name: string; email: string; }
interface Props { onNavigate: (screen: string) => void; user?: CurrentUser | null; }

const API = `http://${window.location.hostname}:8080/api`;
const authHdr = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${(sessionStorage.getItem("authToken") ?? localStorage.getItem("authToken")) ?? ""}`,
});

const INTERESTS = ["Javni govor", "Pregovaranje", "Liderstvo", "Prodaja", "Debate", "Prezentacije"];
const LEVELS = [
  { id: "beginner",     label: "Početnik", Icon: Sprout },
  { id: "intermediate", label: "Srednji",  Icon: Flame  },
  { id: "advanced",     label: "Napredan", Icon: Zap    },
];

function initials(name: string): string {
  return name.split(" ").map(p => p[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";
}

export function ProfileScreen({ onNavigate, user: userProp }: Props) {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(userProp?.name ?? "");
  const [email, setEmail] = useState(userProp?.email ?? "");
  const [interests, setInterests] = useState<string[]>([]);
  const [level, setLevel] = useState("intermediate");
  const [notifications, setNotifications] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API}/users/me`, { headers: authHdr() })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data) {
          const u = data.data;
          setName(u.name ?? userProp?.name ?? "");
          setEmail(u.email ?? userProp?.email ?? "");
          setInterests(u.interests ?? []);
          setAvatarUrl(u.avatarUrl ?? null);
          if (u.experienceLevel) {
            const lvl = (u.experienceLevel as string).toLowerCase();
            setLevel(lvl === "beginner" || lvl === "intermediate" || lvl === "advanced" ? lvl : "intermediate");
          }
          setNotifications(u.notificationsEnabled ?? true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleInterest = (i: string) =>
    setInterests(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAvatarUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/users/me`, {
        method: "PUT",
        headers: authHdr(),
        body: JSON.stringify({ name, interests, experienceLevel: level.toUpperCase(), notificationsEnabled: notifications, avatarUrl }),
      });
    } catch { /* best effort */ } finally {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const inputStyle = { background: "oklch(0.97 0.005 268)", border: "1px solid oklch(0.88 0.012 268)", fontSize: "15px" };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <button onClick={() => onNavigate("dashboard")} className="p-2 -ml-2 text-muted-foreground"><ArrowLeft size={20} /></button>
          <h2 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>Profil</h2>
          <div className="w-8" />
        </div>

        <div className="flex flex-col items-center py-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          {loading ? (
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.93 0.008 268)" }}>
              <Loader2 size={24} className="text-muted-foreground animate-spin" />
            </div>
          ) : (
            <button className="relative" onClick={() => fileInputRef.current?.click()}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profil" className="w-20 h-20 rounded-full object-cover"
                  style={{ border: "3px solid oklch(0.88 0.012 268)" }} />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white"
                  style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.55 0.20 196))", fontSize: "28px", fontWeight: 700 }}>
                  {initials(name)}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.52 0.26 278)" }}>
                <Camera size={13} className="text-white" />
              </div>
            </button>
          )}
          <p className="text-foreground mt-2" style={{ fontSize: "17px", fontWeight: 600 }}>{name || "—"}</p>
          <p className="text-muted-foreground" style={{ fontSize: "13px" }}>{email || "—"}</p>
        </div>

        <div className="px-5 flex flex-col gap-4">
          <div>
            <label className="text-muted-foreground mb-1.5 block"
              style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Ime / nadimak
            </label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-foreground outline-none transition-all" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "oklch(0.52 0.26 278)")}
              onBlur={e => (e.target.style.borderColor = "oklch(0.88 0.012 268)")} />
          </div>

          <div>
            <label className="text-muted-foreground mb-2 block"
              style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Interesovanja
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => {
                const active = interests.includes(i);
                return (
                  <button key={i} onClick={() => toggleInterest(i)} className="px-3 py-1.5 rounded-full transition-all"
                    style={{ background: active ? "oklch(0.95 0.06 278)" : "oklch(0.97 0.005 268)", border: `1.5px solid ${active ? "oklch(0.70 0.14 278)" : "oklch(0.88 0.012 268)"}`, color: active ? "oklch(0.42 0.24 278)" : "oklch(0.52 0.04 268)", fontSize: "12px", fontWeight: active ? 600 : 400 }}>
                    {i}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-muted-foreground mb-2 block"
              style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Nivo iskustva
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map(l => {
                const active = level === l.id;
                return (
                  <button key={l.id} onClick={() => setLevel(l.id)} className="py-3 rounded-xl flex flex-col items-center gap-1.5 transition-all"
                    style={{ background: active ? "oklch(0.95 0.06 278)" : "oklch(0.97 0.005 268)", border: `1.5px solid ${active ? "oklch(0.70 0.14 278)" : "oklch(0.88 0.012 268)"}` }}>
                    <l.Icon size={18} style={{ color: active ? "oklch(0.42 0.24 278)" : "oklch(0.65 0.04 268)" }} strokeWidth={1.5} />
                    <span style={{ fontSize: "11px", fontWeight: active ? 600 : 400, color: active ? "oklch(0.42 0.24 278)" : "oklch(0.52 0.04 268)" }}>{l.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid oklch(0.88 0.012 268)" }}>
            {[
              { icon: Bell, label: "Push notifikacije", toggle: true, value: notifications, onToggle: () => setNotifications(n => !n) },
              { icon: Lock, label: "Promjena lozinke", toggle: false, screen: "change-password" },
              { icon: Shield, label: "Privatnost", toggle: false, screen: "privacy" },
            ].map((item, i) => (
              <div key={item.label}
                className="flex items-center gap-3 px-4 py-3.5 bg-card cursor-pointer"
                style={{ borderBottom: i < 2 ? "1px solid oklch(0.92 0.008 268)" : "none" }}
                onClick={() => !item.toggle && item.screen && onNavigate(item.screen)}>
                <item.icon size={18} className="text-muted-foreground" />
                <span className="flex-1 text-foreground" style={{ fontSize: "14px" }}>{item.label}</span>
                {item.toggle ? (
                  <div onClick={item.onToggle} className="relative cursor-pointer transition-all"
                    style={{ width: "40px", height: "22px", borderRadius: "11px", background: item.value ? "oklch(0.52 0.26 278)" : "oklch(0.80 0.02 268)" }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                      style={{ left: item.value ? "calc(100% - 18px)" : "2px" }} />
                  </div>
                ) : (
                  <ChevronRight size={16} className="text-muted-foreground" />
                )}
              </div>
            ))}
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full py-4 rounded-2xl text-white transition-all flex items-center justify-center gap-2"
            style={{ background: saved ? "oklch(0.52 0.19 145)" : "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "15px", fontWeight: 600, boxShadow: "0 4px 20px oklch(0.52 0.26 278 / 0.25)" }}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saved ? "Sačuvano" : "Spremi promjene"}
          </button>

          <button onClick={() => onNavigate("splash")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-destructive mb-4 transition-opacity active:opacity-70"
            style={{ background: "oklch(0.97 0.02 25)", border: "1px solid oklch(0.90 0.06 25)", fontSize: "14px", fontWeight: 500 }}>
            <LogOut size={16} /> Odjavi se
          </button>
        </div>
      </div>
      <BottomNav current="profile" onNavigate={onNavigate} />
    </div>
  );
}
