import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { API } from "../../services/api";

interface Props {
  onNavigate: (screen: string) => void;
  onLoginSuccess?: (user: { id: number; name: string; email: string }) => void;
}

export function RegisterScreen({ onNavigate, onLoginSuccess }: Props) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Ime je obavezno";
    if (!form.email.includes("@")) e.email = "Nevažeći e-mail format";
    if (form.password.length < 6) e.password = "Lozinka mora imati najmanje 6 znakova";
    if (form.password !== form.confirm) e.confirm = "Lozinke se ne podudaraju";
    if (!terms) e.terms = "Morate prihvatiti uvjete korišćenja";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setApiError("");
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${API}/auth/register`, {
        signal: controller.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      clearTimeout(timer);
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.message || "Registracija nije uspjela.");
        return;
      }
      sessionStorage.setItem("authToken", data.data.token);
      localStorage.setItem("authToken", data.data.token);
      localStorage.setItem("onboardingCompleted", "false");
      onLoginSuccess?.(data.data.user);
      onNavigate("onboarding");
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === "AbortError") {
        setApiError("Zahtjev je istekao. Provjerite vezu sa serverom.");
      } else {
        setApiError("Greška pri povezivanju sa serverom.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputBase = (err?: string) => ({
    background: "oklch(0.97 0.005 268)",
    border: `1.5px solid ${err ? "oklch(0.60 0.18 25)" : "oklch(0.88 0.012 268)"}`,
    fontSize: "15px",
  });


  return (
    <div className="h-full flex flex-col px-6 py-4 bg-background overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <button onClick={() => onNavigate("splash")} className="self-start p-2 -ml-2 text-muted-foreground"><ArrowLeft size={20} /></button>
      <div className="mt-4 mb-5">
        <h1 className="text-foreground" style={{ fontSize: "26px", fontWeight: 700 }}>Kreiraj nalog</h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>Počnite svoje komunikacijsko putovanje</p>
      </div>

      <div className="flex flex-col gap-3.5">
        {[
          { key: "name", label: "Ime / nadimak", type: "text", placeholder: "Vaše ime" },
          { key: "email", label: "E-mail", type: "email", placeholder: "vas@email.com" },
        ].map(f => (
          <div key={f.key}>
            <label className="text-muted-foreground mb-1.5 block" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{f.label}</label>
            <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
              className="w-full px-4 py-3.5 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none transition-all" style={inputBase(errors[f.key])}
              onFocus={e => (e.target.style.borderColor = "oklch(0.52 0.26 278)")}
              onBlur={e => (e.target.style.borderColor = errors[f.key] ? "oklch(0.60 0.18 25)" : "oklch(0.88 0.012 268)")} />
            {errors[f.key] && <p className="text-destructive mt-1" style={{ fontSize: "12px" }}>{errors[f.key]}</p>}
          </div>
        ))}

        <div>
          <label className="text-muted-foreground mb-1.5 block" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Lozinka</label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 znakova"
              className="w-full px-4 py-3.5 pr-12 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none transition-all" style={inputBase(errors.password)}
              onFocus={e => (e.target.style.borderColor = "oklch(0.52 0.26 278)")}
              onBlur={e => (e.target.style.borderColor = errors.password ? "oklch(0.60 0.18 25)" : "oklch(0.88 0.012 268)")} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-destructive mt-1" style={{ fontSize: "12px" }}>{errors.password}</p>}
        </div>

        <div>
          <label className="text-muted-foreground mb-1.5 block" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Potvrdi lozinku</label>
          <input type="password" value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} placeholder="Ponovite lozinku"
            className="w-full px-4 py-3.5 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none transition-all" style={inputBase(errors.confirm)}
            onFocus={e => (e.target.style.borderColor = "oklch(0.52 0.26 278)")}
            onBlur={e => (e.target.style.borderColor = errors.confirm ? "oklch(0.60 0.18 25)" : "oklch(0.88 0.012 268)")} />
          {errors.confirm && <p className="text-destructive mt-1" style={{ fontSize: "12px" }}>{errors.confirm}</p>}
        </div>

        <label className="flex items-start gap-3 cursor-pointer mt-1">
          <div onClick={() => setTerms(!terms)} className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all"
            style={{ background: terms ? "oklch(0.52 0.26 278)" : "white", border: `1.5px solid ${terms ? "oklch(0.52 0.26 278)" : "oklch(0.78 0.02 268)"}` }}>
            {terms && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <span className="text-muted-foreground leading-tight" style={{ fontSize: "13px" }}>
            Prihvatam <span className="text-primary">Uvjete korišćenja</span> i <span className="text-primary">Politiku privatnosti</span>
          </span>
        </label>
        {errors.terms && <p className="text-destructive" style={{ fontSize: "12px" }}>{errors.terms}</p>}

        {apiError && (
          <div className="px-4 py-3 rounded-xl" style={{ background: "oklch(0.96 0.02 25)", border: "1px solid oklch(0.88 0.08 25)" }}>
            <p className="text-destructive" style={{ fontSize: "13px" }}>{apiError}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-4 rounded-2xl text-white mt-1 transition-opacity active:opacity-80 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "15px", fontWeight: 600, boxShadow: "0 4px 20px oklch(0.52 0.26 278 / 0.28)" }}>
          {loading ? "Kreiranje naloga..." : "Registruj se"}
        </button>
      </div>

      <div className="mt-auto pt-4 pb-2 text-center">
        <p className="text-muted-foreground" style={{ fontSize: "14px" }}>
          Već imate nalog?{" "}
          <button onClick={() => onNavigate("login")} className="text-primary" style={{ fontWeight: 600 }}>Prijavite se</button>
        </p>
      </div>
    </div>
  );
}
