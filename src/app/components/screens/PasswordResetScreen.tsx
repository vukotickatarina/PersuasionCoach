import { useState } from "react";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

interface Props { onNavigate: (screen: string) => void; }

export function PasswordResetScreen({ onNavigate }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="h-full flex flex-col px-6 py-4 bg-background">
      <button onClick={() => onNavigate("login")} className="self-start p-2 -ml-2 text-muted-foreground"><ArrowLeft size={20} /></button>

      {!sent ? (
        <>
          <div className="mt-6 mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "oklch(0.95 0.06 278)" }}>
              <Mail size={24} style={{ color: "oklch(0.52 0.26 278)" }} />
            </div>
            <h1 className="text-foreground" style={{ fontSize: "26px", fontWeight: 700 }}>Resetuj lozinku</h1>
            <p className="text-muted-foreground mt-2 leading-relaxed" style={{ fontSize: "14px" }}>
              Unesite e-mail adresu i poslaćemo vam link za resetovanje lozinke.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>E-mail adresa</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vas@email.com"
                className="w-full px-4 py-3.5 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none transition-all"
                style={{ background: "oklch(0.97 0.005 268)", border: "1px solid oklch(0.88 0.012 268)", fontSize: "15px" }}
                onFocus={e => (e.target.style.borderColor = "oklch(0.52 0.26 278)")}
                onBlur={e => (e.target.style.borderColor = "oklch(0.88 0.012 268)")} />
            </div>
            <button onClick={() => email.includes("@") && setSent(true)} className="w-full py-4 rounded-2xl text-white transition-opacity active:opacity-80"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "15px", fontWeight: 600, opacity: email.includes("@") ? 1 : 0.5, boxShadow: "0 4px 20px oklch(0.52 0.26 278 / 0.28)" }}>
              Pošalji link
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "oklch(0.95 0.06 145)" }}>
            <CheckCircle2 size={32} style={{ color: "oklch(0.42 0.17 145)" }} />
          </div>
          <h2 className="text-foreground text-center" style={{ fontSize: "22px", fontWeight: 700 }}>Link poslan!</h2>
          <p className="text-muted-foreground text-center leading-relaxed" style={{ fontSize: "14px" }}>
            Provjerite vaš inbox na <span className="text-foreground font-medium">{email}</span> i pratite upute za resetovanje lozinke.
          </p>
          <button onClick={() => onNavigate("login")} className="mt-4 py-4 px-8 rounded-2xl text-white"
            style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "15px", fontWeight: 600 }}>
            Nazad na prijavu
          </button>
        </div>
      )}
    </div>
  );
}
