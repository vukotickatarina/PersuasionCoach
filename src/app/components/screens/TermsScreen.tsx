import { ArrowLeft } from "lucide-react";

interface Props { onNavigate: (screen: string) => void; }

const SECTIONS = [
  {
    title: "1. Prihvatanje uvjeta",
    body: "Korišćenjem aplikacije Persuasion Coach pristajete na ove Uvjete korišćenja. Ako se ne slažete s bilo kojim dijelom, molimo vas da prestanete koristiti aplikaciju.",
  },
  {
    title: "2. Upotreba aplikacije",
    body: "Aplikacija je namijenjena isključivo edukativnim svrhama razvoja komunikacijskih vještina. Zabranjeno je korišćenje u svrhe prevare, uznemiravanja ili kršenja prava trećih lica.",
  },
  {
    title: "3. Korisnički nalog",
    body: "Odgovorni ste za sigurnost vašeg naloga i lozinke. Odmah nas obavijestite o neovlaštenom pristupu vašem nalogu na support@persuasioncoach.app.",
  },
  {
    title: "4. Intelektualno vlasništvo",
    body: "Sav sadržaj, uključujući scenarije, analize i UI dizajn, vlasništvo su kompanije Persuasion Tech d.o.o. Zabranjeno kopiranje ili distribucija bez dozvole.",
  },
  {
    title: "5. Privatnost podataka",
    body: "Vaši podaci se obrađuju u skladu s našom Politikom privatnosti i relevantnim zakonodavstvom EU (GDPR). Možete zatražiti brisanje podataka u bilo koje vrijeme.",
  },
  {
    title: "6. Ograničenje odgovornosti",
    body: "Aplikacija se pruža 'kakva jeste'. Ne garantujemo neprekidan rad servisa. Ne odgovaramo za indirektne ili posljedične štete nastale korišćenjem aplikacije.",
  },
  {
    title: "7. Izmjene uvjeta",
    body: "Zadržavamo pravo izmjene ovih uvjeta. Korisnici će biti obavješteni o značajnim izmjenama putem e-maila ili push notifikacije.",
  },
  {
    title: "8. Mjerodavno pravo",
    body: "Na ove uvjete primjenjuje se pravo Bosne i Hercegovine. Sporovi se rješavaju pred nadležnim sudom u Sarajevu.",
  },
];

export function TermsScreen({ onNavigate }: Props) {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={() => onNavigate("settings")} className="p-2 -ml-2 text-muted-foreground"><ArrowLeft size={20} /></button>
        <h2 className="text-foreground flex-1" style={{ fontSize: "18px", fontWeight: 700 }}>Uvjeti korišćenja</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6" style={{ scrollbarWidth: "none" }}>
        <div className="rounded-2xl px-4 py-3 mb-5" style={{ background: "oklch(0.96 0.06 55)", border: "1px solid oklch(0.88 0.10 55)" }}>
          <p style={{ fontSize: "12px", color: "oklch(0.44 0.14 55)" }}>
            Posljednje ažuriranje: 15. decembra 2024.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {SECTIONS.map((s, i) => (
            <div key={i} className="rounded-2xl p-4"
              style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.88 0.012 268)", boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
              <p className="text-foreground mb-2" style={{ fontSize: "14px", fontWeight: 700 }}>{s.title}</p>
              <p className="text-muted-foreground leading-relaxed" style={{ fontSize: "13px" }}>{s.body}</p>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground text-center mt-6" style={{ fontSize: "12px" }}>
          Za pitanja: <span className="text-primary">legal@persuasioncoach.app</span>
        </p>
      </div>
    </div>
  );
}
