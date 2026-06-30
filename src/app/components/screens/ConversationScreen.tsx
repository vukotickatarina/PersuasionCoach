import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Mic, Pause, StopCircle, Lightbulb, UserRound, X } from "lucide-react";

const speechSupported =
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

const API = `http://${window.location.hostname}:8080/api`;

interface Props {
  onNavigate: (screen: string) => void;
  mode?: "attacker" | "mentor" | "debate";
  scenarioId?: number | null;
  sessionId?: number | null;
  initialMessages?: { from: string; text: string }[];
}


export function ConversationScreen({ onNavigate, mode = "attacker", scenarioId, sessionId: sessionIdProp, initialMessages: initialMessagesProp }: Props) {
  const [messages, setMessages] = useState<{ from: string; text: string }[]>(initialMessagesProp ?? []);
  const [input, setInput] = useState("");
  const [showProPopup, setShowProPopup] = useState(false);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(sessionIdProp ?? null);
  const [scenarioTitle, setScenarioTitle] = useState("");
  const [scenarioTopic, setScenarioTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [initError, setInitError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const voicePrefixRef = useRef("");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${(sessionStorage.getItem("authToken") ?? localStorage.getItem("authToken")) ?? ""}`,
  });

  useEffect(() => {
    if (!sessionIdProp) return;
    fetch(`${API}/conversations/${sessionIdProp}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => {
        if (data.data?.scenario) {
          setScenarioTitle(data.data.scenario.title ?? "");
          setScenarioTopic(data.data.scenario.topicTitle ?? "");
        }
      })
      .catch(() => {});
  }, [sessionIdProp]);

  useEffect(() => {
    if (sessionIdProp) return;
    if (!scenarioId) {
      setInitError("Nije odabran scenarij.");
      return;
    }
    fetch(`${API}/conversations/start`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ scenarioId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.data?.id) {
          setSessionId(data.data.id);
          setScenarioTitle(data.data.scenario?.title ?? "");
          setScenarioTopic(data.data.scenario?.topicTitle ?? "");
          const initMsgs = (data.data.messages ?? []) as { content: string; sender: string }[];
          setMessages(initMsgs.map(m => ({ from: m.sender === "AI" ? "ai" : "user", text: m.content })));
        } else {
          setInitError(data.message || "Greška pri pokretanju sesije.");
        }
      })
      .catch(() => setInitError("Greška pri povezivanju sa serverom."));
  }, [scenarioId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!paused) interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !sessionId || aiLoading) return;
    const userText = input.trim();
    setMessages(p => [...p, { from: "user", text: userText }]);
    setInput("");
    setAiLoading(true);
    try {
      const endpoint = mode === "mentor"
        ? `${API}/conversations/${sessionId}/mentor-message`
        : `${API}/conversations/${sessionId}/message`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ content: userText }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) {
        const aiMsg = (data.data as { content: string; sender: string }[])
          .filter(m => m.sender === "AI")
          .at(-1);
        if (aiMsg) setMessages(p => [...p, { from: "ai", text: aiMsg.content }]);
      }
    } catch {
      setMessages(p => [...p, { from: "ai", text: "Greška pri dobivanju odgovora." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleEnd = async () => {
    if (sessionId) {
      try {
        await fetch(`${API}/conversations/${sessionId}/end`, {
          method: "PUT",
          headers: authHeaders(),
        });
      } catch {}
    }
    onNavigate("session-summary");
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "hr-HR";
    recognition.interimResults = true;
    recognition.continuous = false;
    voicePrefixRef.current = input.trim() ? input.trim() + " " : "";
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as ArrayLike<SpeechRecognitionResult>)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join("");
      setInput(voicePrefixRef.current + transcript);
    };
    recognition.onend = () => { setIsListening(false); recognitionRef.current = null; };
    recognition.onerror = () => { setIsListening(false); recognitionRef.current = null; };
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopListening = () => recognitionRef.current?.stop();

  const toggleListening = () => {
    if (!speechSupported) {
      setVoiceError("Glasovni unos nije podržan u ovom browseru");
      setTimeout(() => setVoiceError(""), 3500);
      return;
    }
    isListening ? stopListening() : startListening();
  };

  useEffect(() => () => { recognitionRef.current?.stop(); }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-4 pt-3 pb-3 shrink-0" style={{ borderBottom: "1px solid oklch(0.88 0.012 268)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("select-topic")} className="text-muted-foreground"><ArrowLeft size={20} /></button>
          {(() => {
            const isReal = scenarioTopic.startsWith("Stvarna situacija:");
            const displayTitle = isReal ? "Stvarna situacija" : (scenarioTitle || "Učitavanje...");
            const displaySub   = isReal ? scenarioTopic.replace("Stvarna situacija:", "").trim() : (scenarioTopic || "—");
            return (
              <div className="flex items-center gap-2.5 flex-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: isReal ? "#f59e0b1a" : "oklch(0.96 0.06 15)" }}>
                  <UserRound size={18} style={{ color: isReal ? "#f59e0b" : "oklch(0.50 0.20 15)" }} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{displayTitle}</p>
                    <span
                      className="px-1.5 py-0.5 rounded-md"
                      style={{
                        background: mode === "mentor" ? "oklch(0.95 0.06 196)" : "oklch(0.96 0.06 15)",
                        color: mode === "mentor" ? "oklch(0.46 0.18 196)" : "oklch(0.50 0.20 15)",
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {mode === "mentor" ? "MENTOR MOD" : "NAPADAČKI MOD"}
                    </span>
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{displaySub}</p>
                </div>
              </div>
            );
          })()}
          <div className="text-right">
            <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(duration)}</p>
            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{messages.length} poruka</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3" style={{ scrollbarWidth: "none", background: "oklch(0.97 0.004 268)" }}>
        {initError && (
          <div className="px-4 py-3 rounded-xl mx-1" style={{ background: "oklch(0.96 0.02 25)", border: "1px solid oklch(0.88 0.08 25)" }}>
            <p style={{ fontSize: "13px", color: "oklch(0.50 0.20 15)" }}>{initError}</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            {m.from === "ai" && (
              <div className="mr-2 mt-1 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(0.96 0.06 15)" }}>
                <UserRound size={14} style={{ color: "oklch(0.50 0.20 15)" }} strokeWidth={1.5} />
              </div>
            )}
            <div className="max-w-[75%] px-4 py-3 leading-snug"
              style={{ background: m.from === "user" ? "oklch(0.52 0.26 278)" : "oklch(1 0 0)", color: m.from === "user" ? "white" : "oklch(0.18 0.025 268)", fontSize: "14px", borderRadius: m.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", boxShadow: "0 1px 4px oklch(0 0 0 / 0.06)" }}>
              {m.text}
            </div>
          </div>
        ))}
        {aiLoading && (
          <div className="flex justify-start">
            <div className="mr-2 mt-1 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.96 0.06 15)" }}>
              <UserRound size={14} style={{ color: "oklch(0.50 0.20 15)" }} strokeWidth={1.5} />
            </div>
            <div className="px-4 py-3 rounded-2xl" style={{ background: "oklch(1 0 0)", fontSize: "14px", color: "oklch(0.55 0.04 268)" }}>
              ...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showProPopup && (
        <div className="absolute inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setShowProPopup(false)}>
          <div className="w-full rounded-t-3xl p-6 pb-8" style={{ background: "oklch(1 0 0)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: "oklch(0.95 0.06 278)" }}>
                <Lightbulb size={20} style={{ color: "oklch(0.52 0.26 278)" }} />
              </div>
              <button onClick={() => setShowProPopup(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.93 0.008 268)" }}>
                <X size={15} className="text-muted-foreground" />
              </button>
            </div>
            <p className="text-foreground mb-1" style={{ fontSize: "17px", fontWeight: 700 }}>Pro funkcija</p>
            <p className="text-muted-foreground mb-5 leading-relaxed" style={{ fontSize: "14px" }}>
              Savjeti u realnom vremenu su dostupni samo u Pro verziji. Završite vježbu da dobijete detaljan feedback.
            </p>
            <button onClick={() => setShowProPopup(false)}
              className="w-full py-3.5 rounded-2xl text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", fontSize: "15px", fontWeight: 600 }}>
              U redu
            </button>
          </div>
        </div>
      )}

      <div className="px-4 pb-4 pt-2 shrink-0 bg-background" style={{ borderTop: "1px solid oklch(0.88 0.012 268)" }}>
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setPaused(!paused)}
            className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
            style={{ background: "oklch(0.95 0.008 268)", border: "1px solid oklch(0.88 0.012 268)", fontSize: "12px", color: "oklch(0.52 0.04 268)" }}>
            <Pause size={12} /> {paused ? "Nastavi" : "Pauza"}
          </button>
          <button onClick={() => setShowProPopup(true)}
            className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
            style={{ background: "oklch(0.95 0.008 268)", border: "1px solid oklch(0.88 0.012 268)", fontSize: "12px", color: "oklch(0.52 0.04 268)" }}>
            <Lightbulb size={12} /> Savjeti
          </button>
          <button onClick={handleEnd}
            className="ml-auto px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
            style={{ background: "oklch(0.97 0.02 25)", border: "1px solid oklch(0.90 0.06 25)", fontSize: "12px", color: "oklch(0.50 0.20 15)" }}>
            <StopCircle size={12} /> Završi
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center rounded-2xl overflow-hidden"
            style={{ background: "oklch(0.97 0.005 268)", border: `1px solid ${isListening ? "oklch(0.65 0.22 15)" : "oklch(0.88 0.012 268)"}` }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={isListening ? "Slušam..." : "Unesite argument..."}
              className="flex-1 px-4 py-3 bg-transparent text-foreground placeholder-muted-foreground/50 outline-none"
              style={{ fontSize: "14px" }} />
          </div>
          <button
            onClick={toggleListening}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all${isListening ? " animate-pulse" : ""}`}
            style={{
              background: isListening ? "oklch(0.50 0.22 15)" : "oklch(0.95 0.008 268)",
              border: `1px solid ${isListening ? "oklch(0.60 0.22 15)" : "oklch(0.88 0.012 268)"}`,
              boxShadow: isListening ? "0 0 0 3px oklch(0.50 0.22 15 / 0.20)" : "none",
            }}>
            <Mic size={18} style={{ color: isListening ? "white" : "oklch(0.55 0.04 268)" }} />
          </button>
          <button onClick={handleSend}
            disabled={aiLoading || !sessionId}
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", boxShadow: "0 2px 12px oklch(0.52 0.26 278 / 0.30)" }}>
            <Send size={16} className="text-white" />
          </button>
        </div>
        {voiceError && (
          <p style={{ fontSize: "11px", color: "oklch(0.50 0.20 15)", textAlign: "center", paddingTop: "6px" }}>
            {voiceError}
          </p>
        )}
      </div>
    </div>
  );
}
