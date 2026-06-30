import { useState } from "react";
import { ArrowLeft, ChevronDown, Mail, MessageSquare } from "lucide-react";

interface Props { onNavigate: (screen: string) => void; }

const FAQS = [
  { q: "Kako funkcionišu simulacije razgovora?", a: "Odaberete temu i scenarij, zatim razgovarate s AI sagovornikom koji simulira realnog sagovornika. Svaki sagovornik ima jedinstveni profil i stil reagovanja." },
  { q: "Kako se računa moj napredak?", a: "Napredak se mjeri kroz jasnoću argumenata, uvjerljivost, ton i prilagodbu sagovorniku. Svaka sesija donosi bodove koji utiču na vaš nivo." },
  { q: "Mogu li koristiti glasovni unos?", a: "Da, u ekranu simulacije razgovora postoji dugme za snimanje glasa. Potrebna su dozvola za mikrofon." },
  { q: "Kako funkcioniše plan učenja?", a: "Plan učenja je personalizovani raspored vježbi baziran na vašim ciljevima i slabim tačkama. Možete ga uređivati i postavljati podsjetnik." },
  { q: "Zašto se moje značke ne prikazuju?", a: "Značke se dodjeljuju automatski nakon ispunjenih uvjeta. Ako ne vidite novu značku, pokušajte osvježiti stranicu ili se ponovo prijaviti." },
  { q: "Kako mogu obrisati nalog?", a: "Idite na Podešavanja → opcija brisanja naloga na dnu stranice. Napomena: ova radnja je nepovratna i brisanje svih podataka je trajno." },
  { q: "Je li aplikacija besplatna?", a: "Osnovna funkcionalnost je besplatna. Premium funkcije (napredna analiza, neograničeni scenariji) dostupne su kroz pretplatu." },
];

export function FAQScreen({ onNavigate }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={() => onNavigate("settings")} className="p-2 -ml-2 text-muted-foreground"><ArrowLeft size={20} /></button>
        <h2 className="text-foreground flex-1" style={{ fontSize: "18px", fontWeight: 700 }}>FAQ i podrška</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4" style={{ scrollbarWidth: "none" }}>
        <p className="text-muted-foreground mb-4" style={{ fontSize: "13px" }}>Česta pitanja i odgovori</p>

        <div className="flex flex-col gap-2 mb-6">
          {FAQS.map((f, i) => (
            <div key={i} className="rounded-2xl overflow-hidden"
              style={{ background: "oklch(1 0 0)", border: `1px solid ${open === i ? "oklch(0.75 0.14 278)" : "oklch(0.88 0.012 268)"}` }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                <p className="flex-1 text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{f.q}</p>
                <ChevronDown size={16} className="text-muted-foreground shrink-0 transition-transform"
                  style={{ transform: open === i ? "rotate(180deg)" : "none" }} />
              </button>
              {open === i && (
                <div className="px-4 pb-4" style={{ borderTop: "1px solid oklch(0.93 0.008 268)" }}>
                  <p className="text-muted-foreground leading-relaxed pt-3" style={{ fontSize: "13px" }}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-muted-foreground mb-3" style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Kontaktirajte nas</p>
        <div className="flex flex-col gap-3">
          <button className="flex items-center gap-3 rounded-2xl px-4 py-4 transition-all active:opacity-80"
            style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.95 0.06 278)" }}>
              <Mail size={17} style={{ color: "oklch(0.52 0.26 278)" }} />
            </div>
            <div className="text-left">
              <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>E-mail podrška</p>
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>support@persuasioncoach.app</p>
            </div>
          </button>
          <button className="flex items-center gap-3 rounded-2xl px-4 py-4 transition-all active:opacity-80"
            style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.96 0.06 55)" }}>
              <MessageSquare size={17} style={{ color: "oklch(0.52 0.16 55)" }} />
            </div>
            <div className="text-left">
              <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>Live chat</p>
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Dostupan pon–pet, 9:00–17:00</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
