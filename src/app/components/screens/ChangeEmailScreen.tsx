import { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

interface Props { onNavigate: (screen: string) => void; }

export function ChangeEmailScreen({ onNavigate }: Props) {
  const [currentEmail] = useState("ana.kovac@email.com");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const inputStyle = {
    background: "oklch(0.97 0.005 268)",
    border: "1px solid oklch(0.88 0.012 268)",
    fontSize: "15px",
  };

  const handleSubmit = () => {
    if (!newEmail.includes("@")) { setError("Unesite važeću e-mail adresu."); return; }
    if (!password) { setError("Lozinka je obavezna."); return; }
    setError("");
    setDone(true);
  };

  if (done) return (
    <div className="h-full bg-background flex flex-col items-center justify-center gap-4 px-6">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "oklch(0.95 0.06 145)" }}>
        <CheckCircle2 size={32} style={{ color: "oklch(0.52 0.19 145)" }} />
      </div>
      <h2 className="text-foreground text-center" style={{ fontSize: "22px", fontWeight: 700 }}>E-mail promijenjen!</h2>
      <p className="text-muted-foreground text-center" style={{ fontSize: "14px" }}>
        Vaš novi e-mail je <span className="text-foreground font-medium">{newEmail}</span>
      </p>
      <button onClick={() => onNavigate("settings")} className="mt-4 py-4 px-8 rounded-2xl text-white"
        style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "15px", fontWeight: 600 }}>
        Nazad na podešavanja
      </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col px-6 py-4 bg-background overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <button onClick={() => onNavigate("settings")} className="self-start p-2 -ml-2 text-muted-foreground">
        <ArrowLeft size={20} />
      </button>
      <div className="mt-5 mb-7">
        <h1 className="text-foreground" style={{ fontSize: "24px", fontWeight: 700 }}>Promjena e-maila</h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>Trenutni: <span className="text-foreground">{currentEmail}</span></p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-muted-foreground mb-2 block" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Novi e-mail</label>
          <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="novi@email.com"
            className="w-full px-4 py-3.5 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none transition-all"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "oklch(0.52 0.26 278)")}
            onBlur={e => (e.target.style.borderColor = "oklch(0.88 0.012 268)")} />
        </div>
        <div>
          <label className="text-muted-foreground mb-2 block" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Potvrdi lozinkom</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Vaša trenutna lozinka"
            className="w-full px-4 py-3.5 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none transition-all"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "oklch(0.52 0.26 278)")}
            onBlur={e => (e.target.style.borderColor = "oklch(0.88 0.012 268)")} />
        </div>
        {error && (
          <div className="px-4 py-3 rounded-xl" style={{ background: "oklch(0.96 0.02 25)", border: "1px solid oklch(0.90 0.06 25)" }}>
            <p className="text-destructive" style={{ fontSize: "13px" }}>{error}</p>
          </div>
        )}
        <button onClick={handleSubmit} className="w-full py-4 rounded-2xl text-white mt-2 transition-opacity active:opacity-80"
          style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "15px", fontWeight: 600, boxShadow: "0 4px 20px oklch(0.52 0.26 278 / 0.28)" }}>
          Sačuvaj novi e-mail
        </button>
      </div>
    </div>
  );
}
