import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";

interface Props {
  onNavigate: (screen: string) => void;
}

export function SplashScreen({ onNavigate }: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-between px-6 py-8 relative overflow-hidden bg-background">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-12"
          style={{ background: "radial-gradient(circle, oklch(0.52 0.26 278) 0%, transparent 70%)" }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", boxShadow: "0 8px 32px oklch(0.52 0.26 278 / 0.30)" }}>
            <MessageCircle size={36} className="text-white" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h1 className="text-foreground tracking-tight" style={{ fontSize: "30px", fontWeight: 700 }}>Persuasion</h1>
            <h1 className="tracking-tight" style={{ fontSize: "30px", fontWeight: 700, color: "oklch(0.52 0.26 278)" }}>Coach</h1>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-muted-foreground text-center leading-relaxed"
          style={{ fontSize: "15px" }}
        >
          Razvijaj komunikacijske vještine kroz simulacije razgovora i personalizovani feedback
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full flex flex-col gap-3"
      >
        <button
          onClick={() => onNavigate("register")}
          className="w-full py-4 rounded-2xl text-white transition-opacity active:opacity-80"
          style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "15px", fontWeight: 600, boxShadow: "0 4px 20px oklch(0.52 0.26 278 / 0.28)" }}
        >
          Kreiraj nalog
        </button>
        <button
          onClick={() => onNavigate("login")}
          className="w-full py-4 rounded-2xl text-foreground transition-all active:opacity-80"
          style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", fontSize: "15px", fontWeight: 600, boxShadow: "0 1px 4px oklch(0 0 0 / 0.06)" }}
        >
          Prijavi se
        </button>
        <button
          onClick={() => onNavigate("about")}
          className="text-muted-foreground py-2 transition-colors active:text-foreground"
          style={{ fontSize: "13px" }}
        >
          O aplikaciji
        </button>
      </motion.div>
    </div>
  );
}
