import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, CheckCircle2, Info } from "lucide-react";

interface Props { onNavigate: (screen: string) => void; }

export function ChangePasswordScreen({ onNavigate }: Props) {
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputStyle = { background: "oklch(0.97 0.005 268)", border: "1px solid oklch(0.88 0.012 268)", fontSize: "15px" };

  const handleSubmit = () => {
    const e: Record<string, string> = {};
    if (!form.current) e.current = "Unesite trenutnu lozinku";
    if (form.newPass.length < 6) e.newPass = "Nova lozinka mora imati min. 6 znakova";
    if (form.newPass !== form.confirm) e.confirm = "Lozinke se ne podudaraju";
    if (Object.keys(e).length) { setErrors(e); return; }
    setDone(true);
  };

  if (done) return (
    <div className="h-full bg-background flex flex-col items-center justify-center gap-4 px-6">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "oklch(0.95 0.06 145)" }}>
        <CheckCircle2 size={32} style={{ color: "oklch(0.52 0.19 145)" }} />
      </div>
      <h2 className="text-foreground text-center" style={{ fontSize: "22px", fontWeight: 700 }}>Lozinka promijenjena</h2>
      <p className="text-muted-foreground text-center" style={{ fontSize: "14px" }}>Vaša nova lozinka je aktivna.</p>
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
        <h1 className="text-foreground" style={{ fontSize: "24px", fontWeight: 700 }}>Promjena lozinke</h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>Izaberite sigurnu lozinku</p>
      </div>

      <div className="flex flex-col gap-4">
        {([
          { key: "current", label: "Trenutna lozinka", placeholder: "Vaša trenutna lozinka" },
          { key: "newPass", label: "Nova lozinka", placeholder: "Min. 6 znakova" },
          { key: "confirm", label: "Potvrdi novu lozinku", placeholder: "Ponovite lozinku" },
        ] as const).map(f => (
          <div key={f.key}>
            <label className="text-muted-foreground mb-2 block" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{f.label}</label>
            <div className="relative">
              <input type={show[f.key] ? "text" : "password"} value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-4 py-3.5 pr-12 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none transition-all"
                style={{ ...inputStyle, borderColor: errors[f.key] ? "oklch(0.60 0.18 25)" : "oklch(0.88 0.012 268)" }}
                onFocus={e => (e.target.style.borderColor = "oklch(0.52 0.26 278)")}
                onBlur={e => (e.target.style.borderColor = errors[f.key] ? "oklch(0.60 0.18 25)" : "oklch(0.88 0.012 268)")} />
              <button type="button" onClick={() => setShow(p => ({ ...p, [f.key]: !p[f.key] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1">
                {show[f.key] ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors[f.key] && <p className="text-destructive mt-1" style={{ fontSize: "12px" }}>{errors[f.key]}</p>}
          </div>
        ))}

        <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ background: "oklch(0.95 0.06 278)", border: "1px solid oklch(0.82 0.10 278)" }}>
          <Info size={15} style={{ color: "oklch(0.52 0.26 278)", marginTop: "1px", flexShrink: 0 }} />
          <p style={{ fontSize: "12px", color: "oklch(0.42 0.22 278)", fontWeight: 500 }}>
            Dobra lozinka ima min. 8 znakova, kombinuje slova, brojeve i simbole.
          </p>
        </div>

        <button onClick={handleSubmit} className="w-full py-4 rounded-2xl text-white mt-1 transition-opacity active:opacity-80"
          style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "15px", fontWeight: 600, boxShadow: "0 4px 20px oklch(0.52 0.26 278 / 0.28)" }}>
          Promijeni lozinku
        </button>
      </div>
    </div>
  );
}
