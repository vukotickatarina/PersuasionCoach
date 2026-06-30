import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

interface Props {
  onNavigate: (screen: string) => void;
  onLoginSuccess?: (user: { id: number; name: string; email: string }) => void;
}

export function LoginScreen({ onNavigate, onLoginSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Molimo unesite e-mail i lozinku."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8080/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Pogrešan e-mail ili lozinka.");
        return;
      }
      sessionStorage.setItem("authToken", data.data.token);
      localStorage.setItem("authToken", data.data.token);
      onLoginSuccess?.(data.data.user);
      const onboardingDone = localStorage.getItem("onboardingCompleted");
      if (onboardingDone !== "true") {
        localStorage.setItem("onboardingCompleted", "false");
        onNavigate("onboarding");
      } else {
        onNavigate("dashboard");
      }
    } catch {
      setError("Greška pri povezivanju sa serverom.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "oklch(0.97 0.005 268)",
    border: "1px solid oklch(0.88 0.012 268)",
    fontSize: "15px",
  };

  return (
    <div className="h-full flex flex-col px-6 py-4 bg-background overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <button onClick={() => onNavigate("splash")} className="self-start p-2 -ml-2 text-muted-foreground active:text-foreground transition-colors">
        <ArrowLeft size={20} />
      </button>

      <div className="mt-6 mb-8">
        <h1 className="text-foreground" style={{ fontSize: "26px", fontWeight: 700 }}>Dobrodošli nazad</h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>Prijavite se na vaš nalog</p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-muted-foreground mb-2 block" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="vas@email.com"
            className="w-full px-4 py-3.5 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none transition-all"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "oklch(0.52 0.26 278)")}
            onBlur={e => (e.target.style.borderColor = "oklch(0.88 0.012 268)")}
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-2 block" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Lozinka</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 pr-12 rounded-xl text-foreground placeholder-muted-foreground/50 outline-none transition-all"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "oklch(0.52 0.26 278)")}
              onBlur={e => (e.target.style.borderColor = "oklch(0.88 0.012 268)")}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setRemember(!remember)}
              className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
              style={{ background: remember ? "oklch(0.52 0.26 278)" : "white", border: `1.5px solid ${remember ? "oklch(0.52 0.26 278)" : "oklch(0.78 0.02 268)"}` }}
            >
              {remember && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span className="text-muted-foreground" style={{ fontSize: "13px" }}>Zapamti me</span>
          </label>
          <button onClick={() => onNavigate("password-reset")} className="text-primary" style={{ fontSize: "13px", fontWeight: 600 }}>
            Zaboravili ste lozinku?
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl" style={{ background: "oklch(0.96 0.02 25)", border: "1px solid oklch(0.88 0.08 25)" }}>
            <p className="text-destructive" style={{ fontSize: "13px" }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white mt-2 transition-opacity active:opacity-80 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "15px", fontWeight: 600, boxShadow: "0 4px 20px oklch(0.52 0.26 278 / 0.28)" }}
        >
          {loading ? "Prijavljivanje..." : "Prijavi se"}
        </button>
      </div>

      <div className="mt-auto pt-6 text-center">
        <p className="text-muted-foreground" style={{ fontSize: "14px" }}>
          Nemate nalog?{" "}
          <button onClick={() => onNavigate("register")} className="text-primary" style={{ fontWeight: 600 }}>Registrujte se</button>
        </p>
      </div>
    </div>
  );
}
