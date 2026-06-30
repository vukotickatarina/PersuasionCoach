import { useState, useRef, useEffect, useCallback } from "react";
import { X, Users, Send, Trophy, Copy, Check, Mic } from "lucide-react";

const speechSupported = typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

interface Props {
  onNavigate: (screen: string) => void;
}

interface DebateMessage {
  id?: number;
  userId?: number;
  username?: string;
  content: string;
  aiComment: boolean;
  timestamp?: string;
  type?: string;
}

interface RoomInfo {
  code: string;
  topic: string;
  status: string;
  createdBy: string;
  joinedBy?: string;
  winner?: string;
  aiAnalysis?: string;
}

const API = `http://${window.location.hostname}:8080/api`;
const WS_URL = `ws://${window.location.hostname}:8080/ws/debate`;

function getToken(): string {
  return (sessionStorage.getItem("authToken") ?? localStorage.getItem("authToken")) || "";
}

function getUserInfo(): { id: number; name: string } {
  try {
    const raw = sessionStorage.getItem("currentUser") ?? localStorage.getItem("currentUser");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { id: 0, name: "Korisnik" };
}

type Phase = "lobby" | "waiting" | "debate" | "ended";

interface AnalysisSection { label: string; text: string; color: string; }

const SECTION_MAP: { key: string; label: string; color: string }[] = [
  { key: "ARGUMENTI:",     label: "Argumenti pobjednika",   color: "oklch(0.50 0.17 145)" },
  { key: "UVJERLJIVOST:",  label: "Uvjerljivost",            color: "oklch(0.52 0.26 278)" },
  { key: "SLABOSTI PROTIVNIKA:", label: "Slabosti protivnika", color: "oklch(0.52 0.16 55)" },
  { key: "FINALNA OCJENA:", label: "Finalna ocjena",         color: "oklch(0.46 0.18 196)" },
];

function parseAnalysisSections(text: string): AnalysisSection[] {
  const sections: AnalysisSection[] = [];
  for (const { key, label, color } of SECTION_MAP) {
    const idx = text.indexOf(key);
    if (idx === -1) continue;
    const start = idx + key.length;
    // Find next section or end of text
    let end = text.length;
    for (const other of SECTION_MAP) {
      if (other.key === key) continue;
      const otherIdx = text.indexOf(other.key, start);
      if (otherIdx !== -1 && otherIdx < end) end = otherIdx;
    }
    const sectionText = text.slice(start, end).trim();
    if (sectionText) sections.push({ label, text: sectionText, color });
  }
  return sections;
}

export function DebateScreen({ onNavigate }: Props) {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [topic, setTopic] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const voicePrefixRef = useRef<string>("");
  const user = getUserInfo();
  const myId = Number(user.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      recognitionRef.current?.stop();
    };
  }, []);

  const startListening = () => {
    if (!speechSupported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "hr-HR";
    recognition.interimResults = true;
    recognition.continuous = false;
    voicePrefixRef.current = input;
    recognition.onstart = () => { setIsListening(true); setVoiceError(""); };
    recognition.onresult = (e: any) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      setInput(voicePrefixRef.current + (voicePrefixRef.current && transcript ? " " : "") + transcript);
    };
    recognition.onerror = (e: any) => {
      if (e.error !== "no-speech") setVoiceError("Mikrofon nije dostupan.");
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => recognitionRef.current?.stop();
  const toggleListening = () => isListening ? stopListening() : startListening();

  const connectWS = useCallback(
    (code: string) => {
      if (wsRef.current) wsRef.current.close();
      const ws = new WebSocket(`${WS_URL}/${code}`);

      ws.onopen = () => {
        console.log("WS konekcija uspostavljena za sobu:", code);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "DEBATE_ENDED") {
            setRoom((r) =>
              r
                ? { ...r, status: "COMPLETED", winner: data.winner, aiAnalysis: data.aiAnalysis }
                : r
            );
            setPhase("ended");
            return;
          }
          setMessages((prev) => [
            ...prev,
            {
              id: data.id,
              userId: data.userId,
              username: data.username,
              content: data.content,
              aiComment: data.aiComment,
              timestamp: data.timestamp,
              type: data.type,
            },
          ]);
        } catch (e) {
          console.error("WS parse error:", e);
        }
      };

      ws.onerror = (e) => console.error("WS greška:", e);
      wsRef.current = ws;
    },
    []
  );

  const handleCreate = async () => {
    if (!topic.trim()) {
      setError("Unesite temu debate");
      return;
    }
    setError("");
    try {
      const res = await fetch(`${API}/debate/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Greška pri kreiranju sobe");
      const roomData = data.data;
      setRoom(roomData);
      setPhase("waiting");
      connectWS(roomData.code);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Greška");
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      setError("Unesite kod sobe");
      return;
    }
    setError("");
    try {
      const res = await fetch(`${API}/debate/join/${joinCode.trim()}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Soba nije pronađena ili nije dostupna");
      const roomData = data.data;
      setRoom(roomData);

      const msgRes = await fetch(`${API}/debate/${roomData.code}/messages`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        setMessages(msgData.data ?? []);
      }

      setPhase("debate");
      connectWS(roomData.code);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Greška");
    }
  };

  const startDebate = () => {
    setPhase("debate");
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(
      JSON.stringify({
        type: "MESSAGE",
        userId: user.id,
        username: user.name,
        content: text,
      })
    );
    setInput("");
  };

  const handleEndDebate = async () => {
    if (!room) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "END_DEBATE" }));
    } else {
      try {
        await fetch(`${API}/debate/${room.code}/end`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setPhase("ended");
      } catch {}
    }
  };

  const handleClose = () => {
    wsRef.current?.close();
    onNavigate("dashboard");
  };

  const copyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderText = (text: string) =>
    text.split("\n").map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return <p key={i} dangerouslySetInnerHTML={{ __html: bold }} style={{ margin: "1px 0" }} />;
    });

  if (phase === "lobby") {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
          <button onClick={handleClose} className="p-2 -ml-2 text-muted-foreground">
            <X size={20} />
          </button>
          <div>
            <h2 className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>
              Dvoboj (1:1)
            </h2>
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
              Debatuj uživo sa prijateljem
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-5" style={{ scrollbarWidth: "none" }}>
          {/* Create room */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "oklch(1 0 0)", border: "1.5px solid oklch(0.88 0.012 268)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(0.95 0.06 278)" }}
              >
                <Users size={16} style={{ color: "oklch(0.52 0.26 278)" }} />
              </div>
              <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>
                Kreiraj sobu
              </p>
            </div>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Tema debate (npr. 'Treba li sniziti dob glasanja')"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-foreground"
              style={{
                background: "oklch(0.97 0.005 268)",
                border: "1px solid oklch(0.88 0.012 268)",
                fontSize: "13px",
                marginBottom: "10px",
              }}
            />
            <button
              onClick={handleCreate}
              className="w-full py-3 rounded-xl transition-all"
              style={{
                background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Kreiraj sobu
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div style={{ flex: 1, height: "1px", background: "oklch(0.88 0.012 268)" }} />
            <span className="text-muted-foreground" style={{ fontSize: "12px" }}>
              ili
            </span>
            <div style={{ flex: 1, height: "1px", background: "oklch(0.88 0.012 268)" }} />
          </div>

          {/* Join room */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "oklch(1 0 0)", border: "1.5px solid oklch(0.88 0.012 268)" }}
          >
            <p className="text-foreground mb-3" style={{ fontSize: "15px", fontWeight: 600 }}>
              Pridruži se sobi
            </p>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-cifreni kod sobe"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-foreground text-center"
              maxLength={6}
              style={{
                background: "oklch(0.97 0.005 268)",
                border: "1px solid oklch(0.88 0.012 268)",
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                marginBottom: "10px",
              }}
            />
            <button
              onClick={handleJoin}
              className="w-full py-3 rounded-xl transition-all"
              style={{
                background: joinCode.length === 6 ? "oklch(0.25 0.025 268)" : "oklch(0.92 0.008 268)",
                color: joinCode.length === 6 ? "white" : "oklch(0.65 0.04 268)",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Pridruži se
            </button>
          </div>

          {error && (
            <p className="text-center" style={{ color: "oklch(0.50 0.20 15)", fontSize: "13px" }}>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (phase === "waiting") {
    return (
      <div className="h-full flex flex-col bg-background items-center justify-center px-6 gap-5 relative">
        <button onClick={handleClose} className="absolute top-4 left-3 p-2 text-muted-foreground">
          <X size={20} />
        </button>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))" }}
        >
          <Users size={32} color="white" />
        </div>
        <div className="text-center">
          <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>
            Čeka se protivnik
          </p>
          <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
            Tema: <strong style={{ color: "oklch(0.25 0.025 268)" }}>{room?.topic}</strong>
          </p>
        </div>

        <div
          className="w-full rounded-2xl p-5 text-center"
          style={{ background: "oklch(0.95 0.06 278)", border: "1.5px solid oklch(0.82 0.12 278)" }}
        >
          <p className="text-muted-foreground mb-2" style={{ fontSize: "12px" }}>
            Kod sobe — pošalji prijatelju
          </p>
          <p
            className="text-foreground"
            style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "0.2em", color: "oklch(0.44 0.28 290)" }}
          >
            {room?.code}
          </p>
          <button
            onClick={copyCode}
            className="mt-3 px-4 py-2 rounded-xl flex items-center gap-2 mx-auto transition-all"
            style={{
              background: copied ? "oklch(0.94 0.06 145)" : "oklch(1 0 0)",
              border: "1px solid oklch(0.88 0.012 268)",
              fontSize: "12px",
              color: copied ? "oklch(0.42 0.17 145)" : "oklch(0.52 0.04 268)",
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Kopirano!" : "Kopiraj kod"}
          </button>
        </div>

        <button
          onClick={startDebate}
          className="w-full py-3 rounded-2xl transition-all"
          style={{
            background: "oklch(0.92 0.008 268)",
            color: "oklch(0.52 0.04 268)",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Počni debatu (bez čekanja)
        </button>
      </div>
    );
  }

  if (phase === "ended") {
    const sections = parseAnalysisSections(room?.aiAnalysis ?? "");
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0" style={{ borderBottom: "1px solid oklch(0.88 0.012 268)" }}>
          <button onClick={handleClose} className="p-2 -ml-2 text-muted-foreground"><X size={20} /></button>
          <div className="flex-1">
            <h2 className="text-foreground" style={{ fontSize: "17px", fontWeight: 700 }}>Rezultat debate</h2>
            {room?.topic && <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{room.topic}</p>}
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, oklch(0.52 0.16 55), oklch(0.42 0.18 65))" }}>
            <Trophy size={20} color="white" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4" style={{ scrollbarWidth: "none" }}>
          {/* Winner banner */}
          {room?.winner ? (
            <div className="rounded-2xl px-4 py-4 text-center"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.16 55), oklch(0.42 0.18 65))" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "oklch(1 0 0 / 0.75)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>Pobjednik</p>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "white" }}>{room.winner}</p>
            </div>
          ) : (
            <div className="rounded-2xl px-4 py-4 text-center"
              style={{ background: "oklch(0.95 0.008 268)", border: "1px solid oklch(0.88 0.012 268)" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "oklch(0.52 0.04 268)" }}>Debata izjednačena</p>
            </div>
          )}

          {/* Analysis sections */}
          {sections.length > 0 ? sections.map((s, i) => (
            <div key={i} className="rounded-2xl p-4"
              style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: s.color, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>{s.label}</p>
              <div style={{ fontSize: "13px", color: "oklch(0.25 0.025 268)", lineHeight: 1.65 }}>
                {renderText(s.text)}
              </div>
            </div>
          )) : room?.aiAnalysis ? (
            <div className="rounded-2xl p-4"
              style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "oklch(0.52 0.26 278)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>AI Analiza</p>
              <div style={{ fontSize: "13px", color: "oklch(0.25 0.025 268)", lineHeight: 1.65 }}>
                {renderText(room.aiAnalysis)}
              </div>
            </div>
          ) : null}

          <button onClick={() => onNavigate("dashboard")}
            className="w-full py-4 rounded-2xl"
            style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))", color: "white", fontSize: "15px", fontWeight: 600 }}>
            Na početni ekran
          </button>
        </div>
      </div>
    );
  }

  // Debate phase
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 pt-3 pb-3 shrink-0" style={{ borderBottom: "1px solid oklch(0.88 0.012 268)" }}>
        <div className="flex items-center gap-3">
          <button onClick={handleClose} className="p-1 -ml-1 text-muted-foreground shrink-0">
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "oklch(0.95 0.06 278)" }}
            >
              <Users size={16} style={{ color: "oklch(0.52 0.26 278)" }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 600 }}>
                  {room?.topic ?? "Dvoboj"}
                </p>
                <span
                  className="px-1.5 py-0.5 rounded-md shrink-0"
                  style={{
                    background: "oklch(0.95 0.06 278)",
                    color: "oklch(0.52 0.26 278)",
                    fontSize: "9px",
                    fontWeight: 700,
                  }}
                >
                  DVOBOJ
                </span>
              </div>
              <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
                {room?.createdBy} vs {room?.joinedBy || "čeka se..."}
              </p>
            </div>
          </div>
          <button
            onClick={handleEndDebate}
            className="px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0"
            style={{
              background: "oklch(0.97 0.02 25)",
              border: "1px solid oklch(0.90 0.06 25)",
              fontSize: "11px",
              color: "oklch(0.50 0.20 15)",
            }}
          >
            <Trophy size={11} /> Završi
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5"
        style={{ scrollbarWidth: "none", background: "oklch(0.97 0.004 268)" }}
      >
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
              Debata počinje! Napiši prvi argument.
            </p>
          </div>
        )}
        {messages.map((m, i) => {
          const isMe = m.userId != null && Number(m.userId) === myId;
          if (m.aiComment) {
            return (
              <div key={i} className="mx-2 px-3 py-2.5 rounded-xl"
                style={{ background: "oklch(0.96 0.05 278 / 0.5)", border: "1px solid oklch(0.88 0.10 278)", fontSize: "12px" }}>
                <p className="text-muted-foreground mb-1" style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.52 0.26 278)" }}>
                  AI komentar
                </p>
                <div style={{ color: "oklch(0.44 0.28 290)", lineHeight: 1.5 }}>
                  {renderText(m.content)}
                </div>
              </div>
            );
          }
          return (
            <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <p className="px-1 mb-0.5"
                style={{ fontSize: "10px", fontWeight: 600, color: isMe ? "oklch(0.52 0.26 278)" : "oklch(0.55 0.04 268)" }}>
                {isMe ? "Ti" : (m.username || "Protivnik")}
              </p>
              <div className="max-w-[78%] px-3 py-2.5"
                style={{
                  background: isMe ? "oklch(0.52 0.26 278)" : "oklch(0.93 0.008 268)",
                  color: isMe ? "white" : "oklch(0.18 0.025 268)",
                  fontSize: "13px",
                  borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  boxShadow: "0 1px 3px oklch(0 0 0 / 0.06)",
                  lineHeight: 1.5,
                }}>
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 pb-4 pt-2 shrink-0 bg-background"
        style={{ borderTop: "1px solid oklch(0.88 0.012 268)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex-1 flex items-center rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.97 0.005 268)",
              border: `1px solid ${isListening ? "oklch(0.60 0.22 15)" : "oklch(0.88 0.012 268)"}`,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isListening ? "Slušam..." : "Tvoj argument..."}
              className="flex-1 px-4 py-3 bg-transparent text-foreground placeholder-muted-foreground/50 outline-none"
              style={{ fontSize: "14px" }}
            />
          </div>
          {speechSupported && (
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
          )}
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-all"
            style={{
              background: input.trim()
                ? "linear-gradient(135deg, oklch(0.52 0.26 278), oklch(0.44 0.28 290))"
                : "oklch(0.92 0.008 268)",
              boxShadow: input.trim() ? "0 2px 12px oklch(0.52 0.26 278 / 0.30)" : "none",
            }}
          >
            <Send size={16} className={input.trim() ? "text-white" : "text-muted-foreground"} />
          </button>
        </div>
        {voiceError && (
          <p style={{ fontSize: "11px", color: "oklch(0.50 0.20 15)", marginTop: "6px" }}>{voiceError}</p>
        )}
      </div>
    </div>
  );
}
