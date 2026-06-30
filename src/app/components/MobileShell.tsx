import { ReactNode, useState, useEffect } from "react";

interface MobileShellProps {
  children: ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div
        className="relative bg-background overflow-hidden flex flex-col"
        style={{
          width: "390px",
          height: "844px",
          borderRadius: "44px",
          boxShadow: "0 0 0 1px oklch(0.82 0.015 268), 0 40px 80px oklch(0.52 0.26 278 / 0.12), 0 8px 32px oklch(0 0 0 / 0.08)",
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-8 pt-3 pb-1 shrink-0" style={{ height: "44px" }}>
          <span className="text-foreground/50" style={{ fontSize: "12px", fontWeight: 600 }}>9:41</span>
          <div className="w-28 h-6 rounded-full absolute left-1/2 -translate-x-1/2 top-2" style={{ background: "oklch(0.18 0.025 268)", boxShadow: "inset 0 1px 2px oklch(0 0 0 / 0.3)" }} />
          <div className="flex items-center gap-1.5 text-foreground/60">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><rect x="0" y="3" width="3" height="9" rx="1" fill="currentColor" opacity="0.4"/><rect x="4.5" y="2" width="3" height="10" rx="1" fill="currentColor" opacity="0.6"/><rect x="9" y="0.5" width="3" height="11.5" rx="1" fill="currentColor" opacity="0.8"/><rect x="13.5" y="0" width="2.5" height="12" rx="1" fill="currentColor"/></svg>
            <svg width="15" height="12" viewBox="0 0 15 12" fill="none"><path d="M7.5 2.5C9.8 2.5 11.8 3.5 13.2 5L14.5 3.7C12.7 1.9 10.2 0.8 7.5 0.8C4.8 0.8 2.3 1.9 0.5 3.7L1.8 5C3.2 3.5 5.2 2.5 7.5 2.5Z" fill="currentColor" opacity="0.5"/><path d="M7.5 5.5C9 5.5 10.3 6.1 11.3 7L12.6 5.7C11.2 4.4 9.4 3.5 7.5 3.5C5.6 3.5 3.8 4.4 2.4 5.7L3.7 7C4.7 6.1 6 5.5 7.5 5.5Z" fill="currentColor" opacity="0.75"/><circle cx="7.5" cy="10" r="1.5" fill="currentColor"/></svg>
            <div className="flex items-center">
              <div className="rounded-sm" style={{ width: "22px", height: "11px", padding: "1.5px", boxSizing: "border-box", border: "1px solid oklch(0.50 0.03 268 / 0.5)" }}>
                <div className="bg-foreground rounded-sm" style={{ width: "70%", height: "100%" }} />
              </div>
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
        {/* Home indicator */}
        <div className="flex justify-center pb-2 pt-1 shrink-0">
          <div className="rounded-full" style={{ width: "134px", height: "5px", background: "oklch(0.70 0.03 268)" }} />
        </div>
      </div>
    </div>
  );
}
