import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, BookOpen, StopCircle, Lightbulb, Mic } from "lucide-react";

const speechSupported =
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

interface Props {
  onNavigate: (screen: string) => void;
  sessionId?: number | null;
}

interface Message {
  from: "user" | "ai";
  text: string;
}

const API = `http://${window.location.hostname}:8080/api`;

function getToken(): string {
  return (sessionStorage.getItem("authToken") ?? localStorage.getItem("authToken")) || "";
}

export function ConversationMentorScreen({ onNavigate, sessionId }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "ai",
      text: "Zdravo! Ja sam tvoj AI mentor za uvjeravanje.\n\nNapiši svoj argument i dat ću ti detaljan feedback:\n- Šta je dobro\n- Šta poboljšati\n- Šta reći sljedeće\n\nKreni sa prvim argumentom!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeSessionId = useRef<number | null>(sessionId ?? null);
  const recognitionRef = useRef<any>(null);
  const voicePrefixRef = useRef("");

  useEffect(() => {
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ensureSession = async (): Promise<number | null> => {
    if (activeSessionId.current) return activeSessionId.current;
    try {
      const res = await fetch(`${API}/conversations/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ topicTitle: "Lični stavovi", interlocutorType: "SKEPTICAL_FRIEND", mode: "MENTOR" }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      activeSessionId.current = data.data?.id ?? null;
      return activeSessionId.current;
    } catch {
      return null;
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((p) => [...p, { from: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const sid = await ensureSession();
      if (!sid) throw new Error("Nema sesije");

      const res = await fetch(`${API}/conversations/${sid}/mentor-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) throw new Error("API greška");
      const data = await res.json();
      const aiMsg = Array.isArray(data.data)
        ? data.data.find((m: { sender: string }) => m.sender === "AI")
        : null;

      setMessages((p) => [
        ...p,
        { from: "ai", text: aiMsg?.content ?? "Hvala na argumentu! Nastavi sa sljedećim." },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          from: "ai",
          text: "**Dobro:** Iznijeli ste argument.\n**Poboljšaj:** Dodajte konkretne primjere.\n**Sljedeći korak:** Obratite se emocijama sagovornika.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    if (activeSessionId.current) {
      try {
        await fetch(`${API}/conversations/${activeSessionId.current}/end`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${getToken()}` },
        });
      } catch {}
    }
    onNavigate("session-summary");
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

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

  const renderText = (text: string) =>
    text.split("\n").map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return <p key={i} dangerouslySetInnerHTML={{ __html: bold }} style={{ margin: "2px 0" }} />;
    });

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 pt-3 pb-3 shrink-0" style={{ borderBottom: "1px solid oklch(0.88 0.012 268)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("select-topic")} className="text-muted-foreground">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2.5 flex-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "oklch(0.95 0.06 196)" }}
            >
              <BookOpen size={18} style={{ color: "oklch(0.46 0.18 196)" }} strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
                  AI Mentor
                </p>
                <span
                  className="px-1.5 py-0.5 rounded-md"
                  style={{
                    background: "oklch(0.95 0.06 196)",
                    color: "oklch(0.46 0.18 196)",
                    fontSize: "10px",
                    fontWeight: 600,
                  }}
                >
                  SAVJETNIK MOD
                </span>
              </div>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                Feedback nakon svakog argumenta
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className="text-foreground"
              style={{ fontSize: "13px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
            >
              {fmt(duration)}
            </p>
            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
              {messages.length} poruka
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
        style={{ scrollbarWidth: "none", background: "oklch(0.97 0.004 268)" }}
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            {m.from === "ai" && (
              <div
                className="mr-2 mt-1 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(0.95 0.06 196)" }}
              >
                <Lightbulb size={14} style={{ color: "oklch(0.46 0.18 196)" }} strokeWidth={1.5} />
              </div>
            )}
            <div
              className="max-w-[80%] px-4 py-3 leading-snug"
              style={{
                background:
                  m.from === "user"
                    ? "oklch(0.52 0.26 278)"
                    : "oklch(0.96 0.04 196)",
                color:
                  m.from === "user" ? "white" : "oklch(0.25 0.05 268)",
                fontSize: "13px",
                borderRadius:
                  m.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                boxShadow: "0 1px 4px oklch(0 0 0 / 0.06)",
              }}
            >
              {renderText(m.text)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div
              className="mr-2 mt-1 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.95 0.06 196)" }}
            >
              <Lightbulb size={14} style={{ color: "oklch(0.46 0.18 196)" }} />
            </div>
            <div
              className="px-4 py-3 rounded-2xl"
              style={{ background: "oklch(0.96 0.04 196)", fontSize: "13px" }}
            >
              <span style={{ color: "oklch(0.46 0.18 196)" }}>Analiziram argument...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 pb-4 pt-2 shrink-0 bg-background"
        style={{ borderTop: "1px solid oklch(0.88 0.012 268)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={handleEnd}
            className="ml-auto px-3 py-1.5 rounded-xl flex items-center gap-1.5"
            style={{
              background: "oklch(0.97 0.02 25)",
              border: "1px solid oklch(0.90 0.06 25)",
              fontSize: "12px",
              color: "oklch(0.50 0.20 15)",
            }}
          >
            <StopCircle size={12} /> Završi trening
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex-1 flex items-center rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.97 0.005 268)",
              border: `1px solid ${isListening ? "oklch(0.65 0.22 15)" : "oklch(0.88 0.012 268)"}`,
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isListening ? "Slušam..." : "Napiši argument za feedback..."}
              rows={2}
              className="flex-1 px-4 py-3 bg-transparent text-foreground placeholder-muted-foreground/50 outline-none resize-none"
              style={{ fontSize: "14px" }}
            />
          </div>
          <button
            onClick={toggleListening}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all${isListening ? " animate-pulse" : ""}`}
            style={{
              background: isListening ? "oklch(0.50 0.22 15)" : "oklch(0.95 0.008 268)",
              border: `1px solid ${isListening ? "oklch(0.60 0.22 15)" : "oklch(0.88 0.012 268)"}`,
              boxShadow: isListening ? "0 0 0 3px oklch(0.50 0.22 15 / 0.20)" : "none",
            }}
          >
            <Mic size={18} style={{ color: isListening ? "white" : "oklch(0.55 0.04 268)" }} />
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-all"
            style={{
              background:
                input.trim() && !loading
                  ? "linear-gradient(135deg, oklch(0.46 0.18 196), oklch(0.38 0.20 210))"
                  : "oklch(0.92 0.008 268)",
              boxShadow:
                input.trim() && !loading
                  ? "0 2px 12px oklch(0.46 0.18 196 / 0.30)"
                  : "none",
            }}
          >
            <Send size={16} className={input.trim() && !loading ? "text-white" : "text-muted-foreground"} />
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
