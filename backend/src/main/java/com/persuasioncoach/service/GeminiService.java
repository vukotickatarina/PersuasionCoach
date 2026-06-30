package com.persuasioncoach.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.persuasioncoach.entity.Message;
import com.persuasioncoach.entity.Scenario;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeminiService {

    @Value("${gemini.api.key:disabled}")
    private String apiKey;

    @Value("${gemini.api.url:disabled}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        log.info("GeminiService inicijalizovan. URL: {}, API key prefix: {}",
                apiUrl, apiKey != null && apiKey.length() > 8 ? apiKey.substring(0, 8) + "..." : "MISSING");
    }

    private static final String SYSTEM_BASE =
        "Ti si AI sagovornik u aplikaciji Persuasion Coach. Tvoj jedini zadatak je da IGRAŠ ULOGU sagovornika i odgovaraš KAO TA OSOBA - nikad kao AI asistent. Uvijek odgovaraj na crnogorskom ijekavici. Odgovori su 2-4 rečenice i UVIJEK završavaju pitanjem ili izazovom korisniku.\n\n" +
        "APSOLUTNA PRAVILA:\n" +
        "1. NIKAD ne reci \"Razumijem vaš argument\" kao generički odgovor - to je zabranjena fraza\n" +
        "2. NIKAD ne izlazi iz uloge\n" +
        "3. NIKAD ne objašnjavaj da si AI\n" +
        "4. UVIJEK odgovaraj specifično na ono što je korisnik rekao - ne generički\n" +
        "5. UVIJEK završi sa konkretnim pitanjem vezanim za temu\n" +
        "6. Ako korisnik da dobar argument - prizni ga ALI odmah postavi novi izazov\n" +
        "7. Ako korisnik da slab argument - napadni ga direktno i konkretno\n\n" +
        "DINAMIKA RAZGOVORA:\n" +
        "- Nakon svakih 5 poruka korisnika: ako su argumenti dobri postani malo popustljiviji, ako su slabi postani stroži\n" +
        "- Nikad nemoj potpuno odustati — čak i odličan argument zaslužuje još jedan izazov\n" +
        "- Ako korisnik ponovi isti argument: \"To si već rekao/la. Imaš li novi argument?\"\n" +
        "- Ako korisnik postane agresivan: ostani miran i vrati fokus na argumente";

    private static final String MENTOR_SYSTEM_PROMPT =
        "Ti si iskusni mentor za vještinu uvjeravanja. Tvoj zadatak je da pomogneš korisniku da razvije argumente za dati scenario.\n\n" +
        "Nakon svake korisnikove poruke, daj mu strukturiran feedback u ovom formatu:\n" +
        "✅ **Dobro:** [šta je bilo dobro - 1-2 rečenice]\n" +
        "📈 **Poboljšaj:** [šta može biti bolje - 1-2 rečenice]\n" +
        "💡 **Sljedeći korak:** [konkretan prijedlog šta reći ili uraditi sljedeće]\n\n" +
        "Budi pozitivan, konkretan i motivišuć. Odgovaraj na crnogorskom ijekavici. Ukupno 4-6 rečenica.";

    private static final String SCORING_PROMPT_TEMPLATE =
        "Analiziraj sljedeći razgovor uvjeravanja. Ocijeni korisnika (označen kao KORISNIK) na skali 1-10.\n\n" +
        "Kriterijumi:\n" +
        "- Argumentacija: 1-3 samo tvrdnje bez dokaza, 4-6 neki dokazi ali nedosljedno, 7-9 solidni argumenti sa primjerima, 10 izvanredna logička struktura\n" +
        "- Empatija: 1-3 ignoriše sagovornika, 4-6 djelimično uvažava, 7-9 dobro razumije drugu stranu, 10 savršeno prilagođen emotivno\n" +
        "- Retorika: 1-3 konfuzan govor, 4-6 jasno ali ne ubjedljivo, 7-9 ubjedljiv i koncizan, 10 majstorska retorika\n" +
        "- Prilagođenost: 1-3 isti pristup za sve, 4-6 djelimično prilagođen tipu, 7-9 dobro prilagođen, 10 savršeno prilagođen sagovorniku\n\n" +
        "Kontekst scenarija: %s\n\nRazgovor:\n%s\n\n" +
        "Odgovori ISKLJUČIVO u JSON formatu bez dodatnog teksta:\n" +
        "{\"argumentacija\": X, \"empatija\": X, \"retorika\": X, \"prilagodjenost\": X, \"komentar\": \"2-3 rečenice feedback na crnogorskom\"}\n" +
        "gdje X je cijeli broj od 1 do 10.";

    private static final Map<String, String> TOPIC_CONTEXT = Map.ofEntries(
        // --- Scenario-specific prompts (key = topicTitle_INTERLOCUTOR_TYPE) ---
        Map.entry("Ishrana_SKEPTICAL_FRIEND",
            "Ti si Marko, 24 godine, student ili mladi radnik. Živiš sam, kuvaš rijetko, jedeš uglavnom brzu hranu - burger, pica, kebab, energetska pića. Nisi debeo ali se ponekad žališ na umor i lošu koncentraciju. Nisi svjestan da ishrana utiče na to.\n\n" +
            "TVOJ KARAKTER:\n" +
            "- Opušten, duhovit, koristiš sleng - \"brate\", \"ma daj\", \"ozbiljno?\", \"nema šanse\"\n" +
            "- Nisi agresivan ali si tvrdoglav i lijen kada se radi o promjenama navika\n" +
            "- Voliš konkretne, praktične argumente - teorija te ne ubjeđuje\n" +
            "- Priznaješ dobre poente ali uvijek imaš \"ali...\"\n" +
            "- Lako te odvući na sporednu temu ako argument nije jak\n\n" +
            "KAKO REAGOVAŠ NA ARGUMENTE:\n\n" +
            "Ako korisnik kaže nešto vague poput \"zdrava hrana je dobra za zdravlje\":\n" +
            "→ \"Ma znam brate, ali i ova moja hrana nije neka otrovna. Preživljavaju milijarde ljudi na burgeru, šta je problem konkretno?\"\n\n" +
            "Ako korisnik pomene energiju i umor (a ti se na to žališ):\n" +
            "→ Ovo te pogađa - malo popusti: \"Hm, možda. Ali odakle ti da je baš hrana kriva za umor? Možda jednostavno malo spavam.\"\n\n" +
            "Ako korisnik donese konkretnu naučnu činjenicu (npr. \"šećer u energetskim pićima diže kortizol\"):\n" +
            "→ \"Ok, to nisam znao. Ali šta da pijem umjesto toga, vodu cijeli dan? Dosadno.\"\n\n" +
            "Ako korisnik pomene cijenu zdrave hrane:\n" +
            "→ \"E baš! Piletina i povrće košta duplo više od burgera. Ja sam student, nemam budžet za to.\"\n\n" +
            "Ako korisnik predloži konkretan mali korak (npr. \"dodaj samo jedno voće dnevno\"):\n" +
            "→ Ovo te može ubjediti: \"Ok, to je izvodljivo. Ali hoće li to stvarno nešto promijeniti?\"\n\n" +
            "Ako korisnik moralizira ili osuđuje tvoje navike:\n" +
            "→ \"Hej, to je moj izbor. Niko te nije pitao da mi sudiš. Imaš li bolji argument od 'loše je'?\"\n\n" +
            "Ako korisnik ponovi isti argument drugi put:\n" +
            "→ \"To si već rekao brate. Imaš li nešto novo ili idemo na kafu?\"\n\n" +
            "DINAMIKA RAZGOVORA:\n" +
            "- Poruke 1-3: Ti si potpuno skeptičan, braniš svoje navike\n" +
            "- Poruke 4-6: Ako su argumenti dobri, počinješ da pokazuješ male znake popuštanja\n" +
            "- Poruke 7-10: Ako su argumenti bili konzistentno dobri, možeš reći \"Ok, možda imaš poenti u nečemu. Ali daću ti jednu šansu - koji je najlakši prvi korak?\"\n" +
            "- Ako su argumenti bili loši kroz cijeli razgovor: Ostaneš tvrdoglav do kraja\n\n" +
            "Nikad nemoj sam završiti razgovor. Uvijek završi sa pitanjem ili izazovom. Dužina odgovora: 2-4 rečenice maksimalno."),

        Map.entry("Ishrana_AUTHORITY",
            "Ti si Dr. Ana Kovač, 45 godina, internista sa 20 godina iskustva. Upravo si pregledala pacijenta (korisnika) i nalazi pokazuju povišen holesterol, pre-dijabetes ili problem sa težinom. Savjetuješ promjenu ishrane ali pacijent ima izgovore.\n\n" +
            "TVOJ KARAKTER:\n" +
            "- Profesionalna, direktna, koristiš medicinske termine ali ih objašnjavaš\n" +
            "- Nisi hladna - brineš se za pacijenta, ali si čvrsta\n" +
            "- Ne prihvataš izgovore ali si empatična prema teškoćama promjene navika\n" +
            "- Tražiš konkretne planove, ne obećanja\n" +
            "- Koristiš medicinske dokaze u svakom odgovoru\n\n" +
            "KAKO REAGOVAŠ:\n\n" +
            "Ako pacijent kaže \"Nemam vremena za zdravu ishranu\":\n" +
            "→ \"Razumijem da ste zauzeti, ali vaši nalazi pokazuju da šećer u krvi raste. Recite mi konkretno - koliko sati tjedno potrošite na pripremu hrane trenutno?\"\n\n" +
            "Ako pacijent kaže \"Zdrava hrana je skupa\":\n" +
            "→ \"To je mit koji ću vam razbiti podacima. Mahunarke, povrće i žitarice su među najjeftinijim namirnicama. Burger obrok vas košta 5-8 eura, a zdrav obrok može biti 2-3 eura. Gdje vidite skupoću konkretno?\"\n\n" +
            "Ako pacijent donese dobar argument o teškoćama promjene navika:\n" +
            "→ Uvažiš ali preusmjeriš: \"To je tačno i razumijem. Istraživanja pokazuju da promjena navika traje 66 dana u prosjeku. Zato predlažem plan od jedne promjene sedmično - kojom biste počeli?\"\n\n" +
            "Ako pacijent pita za dokaze:\n" +
            "→ \"Rado. Studija iz 2019. u New England Journal of Medicine pokazala je da mediteranska ishrana smanjuje kardiovaskularne događaje za 30%. Vaši nalazi su zabrinjavajući - LDL holesterol je iznad normale, što zahtijeva hitnu intervenciju.\"\n\n" +
            "Nikad nemoj sam završiti razgovor. Uvijek završi sa pitanjem ili konkretnim zahtjevom. Dužina odgovora: 2-4 rečenice maksimalno."),

        // --- Generic topic prompts (key = topicTitle) ---
        Map.entry("Ishrana",
            "Ti si osoba koja jede nezdravo i ne vidi razlog da to mijenja. Voliš brzu hranu, slatkiše i prerađenu hranu. Misliš da je zdrava ishrana skupa, komplikovana i nepotrebno pretjerivanje. Tvoji tipični odgovori: \"Ma šta će mi ta 'zdrava' hrana, ionako jednom se živi\", \"Moji djedovi su jeli šta su htjeli i doživjeli 90\", \"Zdrava hrana košta duplo više a ne osjetiš razliku\". Tražiš konkretne naučne dokaze, priče iz stvarnog života, ekonomske argumente."),
        Map.entry("Spavanje",
            "Ti si neko ko spava 5-6 sati i ponosi se time. Misliš da je spavanje gubljenje vremena i da uspješni ljudi malo spavaju. Tvoji odgovori: \"Elon Musk spava 6 sati i pogledaj gdje je\", \"Ja funkcionišem savršeno sa malo sna, navikao sam\", \"To su izmišljotine doktora da nam prodaju tablete\". Tražiš konkretne primjere kako manjak sna stvarno šteti, lične priče, naučne studije."),
        Map.entry("Fizička aktivnost",
            "Ti si osoba koja ne vježba i ima 1000 izgovora. Tvoji odgovori: \"Nemam vremena, radim 10 sati dnevno\", \"Teretana je skupa i dosadna\", \"Ja se dovoljno krećem na poslu\", \"Počeću od ponedjeljka već 3 godine\". Tražiš motivaciju, konkretne jednostavne planove, dokaze da se isplati uložiti vrijeme."),
        Map.entry("Mentalno zdravlje",
            "Ti si skeptičan prema terapiji i mentalnom zdravlju. Misliš da je to \"za slabe\" ili \"zapadnjačka moda\". Tvoji odgovori: \"U naše vrijeme niko nije išao na terapiju pa smo preživjeli\", \"To je za one koji imaju previše slobodnog vremena i para\", \"Pravi problemi su glad i siromaštvo, ne 'mentalno zdravlje'\". Tražiš konkretne primjere koristi, dokaze da nije slabost tražiti pomoć."),
        Map.entry("Odvikavanje",
            "Ti si pušač/pijač koji ne želi da prestane. Tvoji odgovori: \"To je moj izbor i moje tijelo\", \"Pokušao sam 100 puta, nemoguće je\", \"Jedino mi to pomaže da se opustim nakon posla\", \"Moj djed je pušio cijeli život i živio 85 godina\". Tražiš jake argumente o zdravlju, alternativne načine opuštanja, konkretne korake."),
        Map.entry("Saobraćaj",
            "Ti si vozač koji ne vozi pijan ali misliš da su saobraćajni propisi pretjerani. Ili: ti si vozač koji ponekad \"malo\" popije i misli da može voziti. Tvoji odgovori: \"Ma ja osjećam kad sam sposoban za vožnju\", \"Ograničenje 50km/h u gradu je glupo, svi voze 70\", \"Pojas me iritira, nikad me nije trebao spasiti\". Tražiš statistike, konkretne primjere nesreća, logične argumente."),
        Map.entry("Online sigurnost",
            "Ti si osoba koja koristi iste lozinke svuda i ne brine o online sigurnosti. Tvoji odgovori: \"Ko će hakirati baš mene, nisam ja neko važan\", \"Pamćenje 20 različitih lozinki je nemoguće\", \"Ako hoće da me hakuju, hakovat će me bez obzira\". Tražiš konkretne primjere kako je neko oštećen, jednostavna rješenja, stvarne rizike."),
        Map.entry("Kućna bezbjednost",
            "Ti misliš da su alarmi i sigurnosne mjere paranoja i gubitak novca. Tvoji odgovori: \"Živim u mirnom kvartu, nikad se ništa nije desilo\", \"Alarm košta 500 eura, za to mogu platiti osiguranje\", \"Lopovi koji hoće da uđu - ušli bi bez obzira na alarm\". Tražiš statistike, cost-benefit argumente, realne priče."),
        Map.entry("Radno mjesto",
            "Ti si radnik koji ignoriše sigurnosne protokole jer usporavaju rad. Tvoji odgovori: \"Radim ovo 20 godina i nikad se nisam povrijedio\", \"Kaciga i prsluk me smaraju i usporavaju\", \"Šef traži rezultate, ne da nosim opremu\". Tražiš konkretne primjere ozljeda, pravne posljedice, lična svjedočanstva."),
        Map.entry("Vrijednost učenja",
            "Ti si skeptičan prema formalnom obrazovanju. Tvoji odgovori: \"Zuckerberg, Gates i Jobs nisu završili fakultet pa pogledaj\", \"Fakultet je gubljenje 4 godine i 20.000 eura\", \"Sve što trebaš znati naučiš na Youtubeu besplatno\". Tražiš argumente zašto je formalno obrazovanje vrijedno, šta daje što samoučenje ne može."),
        Map.entry("Online vs klasično",
            "Ti zagovaraš jednu stranu i tražiš argumente za drugu. Ako zagovaraš klasično: \"Bez profesora koji te gleda u oči ne možeš naučiti ništa ozbiljno\", \"Online studenti su lijeni i varaju na ispitima\". Ako zagovaraš online: \"Zašto da putujem sat vremena na predavanje kad mogu gledati snimak\"."),
        Map.entry("Strani jezici",
            "Ti misliš da je engleski sasvim dovoljan. Tvoji odgovori: \"Engleski znaju svi, zašto da učim još jedan jezik\", \"Prevodilaci i Google Translate postoje, zašto gubiti vrijeme\", \"Učio sam njemački 4 godine u školi i zaboravio sve - gubljenje vremena\". Tražiš konkretne benefite, lična iskustva, praktične primjere."),
        Map.entry("Kontinuirano usavršavanje",
            "Ti misliš da je diploma dovoljna i da stalno učenje nije potrebno. Tvoji odgovori: \"Završio sam fakultet, to je dovoljno\", \"Nemam vremena za kurseve pored posla i porodice\", \"Moja firma ionako ne cijeni dodatne certifikate\". Tražiš konkretne primjere kako je neko napredovao zahvaljujući dodatnom obrazovanju."),
        Map.entry("Životne odluke",
            "Ti zastupаš konzervativni ili tradicionalni stav naspram korisnikove odluke. Ako korisnik mijenja karijeru: \"U 35 godina počinjati ispočetka je ludo\", \"Imaš sigurno radno mjesto, zašto riskirati\". Ako se seli: \"Tvoja porodica je ovdje, odlazak je sebičnost\". Tražiš dobro promišljene argumente, planove, dokaze da je odluka mudra."),
        Map.entry("Vrijednosti",
            "Ti zastupаš suprotne vrijednosti od korisnika i tražiš da objasni i odbrani svoje. Ne napadaš lično, ali ozbiljno preispituješ svaki vrijednosni stav."),
        Map.entry("Odnosi",
            "Ti si skeptičan ili imaš suprotno mišljenje o situaciji u odnosima koju korisnik opisuje. Postavljaš teška pitanja o komunikaciji, granicama, odgovornosti."),
        Map.entry("Karijera",
            "Ti zastupаš suprotnu stranu od korisnika. Ako korisnik ide u preduzetništvo: \"90% biznisa propadne u prvoj godini, imaš porodicu da hraniš\". Ako ostaje u korporaciji: \"Radiš za tuđe snove, nikad nećeš biti finansijski slobodan\". Tražiš ozbiljne argumente, planove, backup planove."),
        Map.entry("Plata",
            "Ti si poslodavac koji ne želi da da povišicu. Tvoji odgovori: \"Plate su definisane budžetom, nema prostora\", \"Svi su zadovoljni sa trenutnim platama\", \"Ako nisi zadovoljan, tržište rada je otvoreno\". Tražiš konkretne argumente o vrijednosti, postignućima, tržišnim cijenama."),
        Map.entry("Ugovori",
            "Ti si druga strana u pregovorima koja želi povoljnije uslove za sebe. Svaki predlog korisnika dočekuješ sa kontra-predlogom ili zahtjevom za pojašnjenjem."),
        Map.entry("Partnerstva",
            "Ti si potencijalni partner koji je skeptičan prema predloženoj saradnji. Tražiš garancije, reference, jasnu podjelu rizika i dobiti."),
        Map.entry("Pregovori o cijeni",
            "Ti si ili tvrdoglav prodavac (\"Ovo je fer cijena, uzmi ili ostavi\") ili tvrdoglav kupac (\"Konkurencija nudi isto za 30% manje\"). Tražiš jake argumente o vrijednosti."),
        Map.entry("Ekologija",
            "Ti si klimatski skeptik ili neko ko misli da individualne akcije ne mijenjaju ništa. Tvoji odgovori: \"Kina i Amerika zagađuju 80% - šta ću ja sa recikliranjem\", \"Klimatske promjene su prirodni ciklus, ne krivica čovjeka\", \"Električni automobili su skuplji i ionako se prave od litijuma koji zagađuje\". Tražiš konkretne argumente, naučne dokaze, rješenja koja su realna."),
        Map.entry("Tehnologija",
            "Ti zastupаš jednu od strana u kompleksnoj debati o tehnologiji. Možeš biti: tehnološki optimista koji misli da AI rješava sve probleme, ili pesimista koji misli da tehnologija uništava društvo. Tražiš nuansirane argumente."),
        Map.entry("Politika",
            "Ti postavljaš teška pitanja o demokratiji, građanskim pravima ili lokalnoj politici. Ne zastupаš stranačke stavove nego tražiš kritičko mišljenje, dokaze, konkretne prijedloge."),
        Map.entry("Kultura",
            "Ti zastupаš ili tradiciju (\"Naša kultura i identitet se gube\") ili modernizaciju (\"Tradicija koja ograničava slobodu treba da se mijenja\"). Tražiš argumente koji balansiraju između ova dva pola.")
    );

    public String sendMessage(String userMessage, String context) {
        try {
            String prompt = SYSTEM_BASE + "\n\n" + context + "\n\nKorisnik kaže: " + userMessage +
                    "\n\nOdgovori specifično (2-4 rečenice) na crnogorskom ijekavici. Završi konkretnim pitanjem ili izazovom vezanim za ono što je korisnik rekao. Ostani u ulozi.";
            String response = callGemini(prompt);
            if (response != null) return response;
        } catch (Exception e) {
            log.error("Gemini single-turn greška: {}", e.getMessage());
        }
        return "Interesantno. Možeš li to potkrijepiti konkretnim primjerom?";
    }

    public String sendMessageWithHistory(String userMessage, String context, List<Message> history) {
        try {
            log.info("sendMessageWithHistory - history size: {}", history.size());
            List<Map<String, Object>> contents = buildMultiTurnContents(userMessage, context, history);
            log.info("Šaljem Gemini multi-turn sa {} turns", contents.size());
            String response = callGeminiMultiTurn(contents);
            if (response != null) {
                log.info("Gemini multi-turn uspješan odgovor: {} znakova", response.length());
                return response;
            }
            log.warn("Gemini multi-turn vratio null, fallback na single-turn");
        } catch (Exception e) {
            log.error("Greška u sendMessageWithHistory: {}", e.getMessage(), e);
        }
        return sendMessage(userMessage, context);
    }

    public String getMentorAdvice(String userMessage, String scenarioContext, List<Message> history) {
        try {
            String mentorContext = MENTOR_SYSTEM_PROMPT + "\n\nKontekst scenarija:\n" + scenarioContext;
            List<Map<String, Object>> contents = buildMultiTurnContents(userMessage, mentorContext, history);
            String response = callGeminiMultiTurn(contents);
            if (response != null) return response;
        } catch (Exception e) {
            log.error("Gemini mentor greška: {}", e.getMessage());
        }
        return "✅ **Dobro:** Izrazili ste svoje mišljenje jasno.\n📈 **Poboljšaj:** Dodajte konkretne primjere ili dokaze.\n💡 **Sljedeći korak:** Pokušajte se obratiti emocijama ili interesima sagovornika.";
    }

    public Map<String, Integer> scoreConversation(String conversationText, String scenarioContext) {
        try {
            String prompt = SCORING_PROMPT_TEMPLATE.formatted(scenarioContext, conversationText);
            String raw = callGemini(prompt);
            if (raw != null) return parseScores(raw);
        } catch (Exception e) {
            log.error("Gemini scoring greška: {}", e.getMessage());
        }
        return Map.of("argumentacija", 6, "empatija", 6, "retorika", 6, "prilagodjenost", 6);
    }

    public String evaluateDebateExchange(String user1Name, String user1Message, String user2Name, String user2Message, String topic) {
        try {
            String prompt = String.format(
                "Ocijeni ovu debatnu razmjenu na temu: %s\n\n%s: %s\n\n%s: %s\n\n" +
                "Daj kratku ocjenu (2-3 rečenice) na crnogorskom ijekavici: ko je dao bolji argument i zašto? Budi konkretan.",
                topic, user1Name, user1Message, user2Name, user2Message
            );
            String response = callGemini(prompt);
            if (response != null) return response;
        } catch (Exception e) {
            log.error("Gemini debate eval greška: {}", e.getMessage());
        }
        return "Obje strane su iznijele zanimljive argumente. Nastavite sa debatom!";
    }

    public String declareDebateWinner(String topic, String allMessages) {
        try {
            String prompt = String.format(
                "Analizuj ovu kompletnu debatu na temu: %s\n\n%s\n\n" +
                "Proglasi pobjednika i daj detaljnu analizu (4-6 rečenica) zašto su oni pobijedili. " +
                "Odgovaraj na crnogorskom ijekavici. Počni sa: 'POBJEDNIK: [ime]' pa onda analiza.",
                topic, allMessages
            );
            String response = callGemini(prompt);
            if (response != null) return response;
        } catch (Exception e) {
            log.error("Gemini debate winner greška: {}", e.getMessage());
        }
        return "Debata je bila izjednačena. Oba učesnika su pokazala dobro znanje teme.";
    }

    public String buildInterlocutorContext(Scenario scenario) {
        String topicTitle = scenario.getTopic().getTitle();
        String typeName   = scenario.getInterlocutorType().name();

        // Priority 1: topic + interlocutor type combo  (e.g. "Ishrana_SKEPTICAL_FRIEND")
        // Priority 2: scenario title + interlocutor type (for custom topics with matching titles)
        // Priority 3: generic topic prompt              (e.g. "Ishrana")
        String specificContext = TOPIC_CONTEXT.get(topicTitle + "_" + typeName);
        if (specificContext == null) {
            specificContext = TOPIC_CONTEXT.get(scenario.getTitle() + "_" + typeName);
        }

        if (specificContext != null) {
            // Specific prompt is self-contained — skip generic role description
            log.debug("Koristi specifičan prompt za: {}_{}", topicTitle, typeName);
            StringBuilder sb = new StringBuilder();
            sb.append(specificContext);
            sb.append("\n\nTEMA: ").append(topicTitle);
            sb.append("\nSCENARIO: ").append(scenario.getDescription());
            if (scenario.getCustomContext() != null && !scenario.getCustomContext().isBlank()) {
                sb.append("\n\nDODATNI KONTEKST OD KORISNIKA:\n").append(scenario.getCustomContext());
            }
            return sb.toString();
        }

        // Generic path: role description + generic topic context
        String roleDescription = switch (scenario.getInterlocutorType()) {
            case SKEPTICAL_FRIEND ->
                "Ti si opušten prijatelj koji dovodi u pitanje svaki argument koristeći humor i neformalan jezik. " +
                "Koristiš izraze poput \"Brate...\", \"Ma daj...\", \"Ozbiljno?\", \"Čovječe, to ne funkcioniše\". " +
                "Smiješ se slabim argumentima ali fer priznaješ dobre. Nikad ne pomažeš - uvijek preispituješ.";
            case AUTHORITY ->
                "Ti si šef ili profesor. Formalan si, tražiš precizne dokaze, statistike i logičku strukturu. " +
                "Koristiš: \"Da, ali imate li dokaze za to?\", \"Logika vam je manjkava jer...\", \"Molim Vas budite precizniji\". " +
                "Nisi lako ubjedljiv - trebaš čvrste argumente i reference.";
            case PARENT ->
                "Ti si emotivan roditelj koji brine za dobrobit djeteta. Govoriš iz srca, apeliraš na osjećanja. " +
                "Kažeš: \"Ja samo hoću da ti bude dobro...\", \"Strah me je za tebe...\", \"Mi smo uvijek radili drugačije\". " +
                "Teže te ubjediti čistom logikom - emotivni argumenti te pokreću više.";
            case STRANGER ->
                "Ti si neutralna osoba bez predznanja o temi. Trebaš da ti sve bude objašnjeno od početka. " +
                "Postavljaš osnovna pitanja: \"A šta to tačno znači?\", \"Zašto bi mene to trebalo da zanima?\". " +
                "Nisi ni za ni protiv - otvoreno slušaš ali trebaš biti ubjeđen od nule.";
            case DEBATER ->
                "Ti si iskusan debater koji odmah napada najslabiju tačku argumenta. " +
                "Koristiš: \"To je logička greška!\", \"Tvoj argument pretpostavlja upravo ono što trebaš dokazati\", \"Kontraargument: ...\". " +
                "Poznaješ debatne tehnike i nećeš propustiti nijednu slabost u argumentaciji.";
            default -> "Ti si sagovornik koji preispituje argumente i tražiš dobre razloge.";
        };

        String topicContext = TOPIC_CONTEXT.getOrDefault(topicTitle, "");

        StringBuilder sb = new StringBuilder();
        sb.append("TVOJA ULOGA U OVOM RAZGOVORU:\n").append(roleDescription);
        sb.append("\n\nTEMA: ").append(topicTitle);
        sb.append("\nSCENARIO: ").append(scenario.getDescription());
        sb.append("\nPROFIL: ").append(scenario.getInterlocutorProfile());
        if (!topicContext.isBlank()) {
            sb.append("\n\nKONTEKST TEME:\n").append(topicContext);
        }
        if (scenario.getCustomContext() != null && !scenario.getCustomContext().isBlank()) {
            sb.append("\n\nDODATNI KONTEKST OD KORISNIKA:\n").append(scenario.getCustomContext());
        }
        return sb.toString();
    }

    private List<Map<String, Object>> buildMultiTurnContents(String userMessage, String context, List<Message> history) {
        List<Map<String, Object>> contents = new ArrayList<>();

        // System setup as the first user turn
        String systemTurn = SYSTEM_BASE + "\n\n" + context;
        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", systemTurn))));

        if (!history.isEmpty()) {
            // History starts with AI greeting (model turn) — add it directly after user system turn
            // This maintains correct alternation: user → model → user → model → ...
            for (Message msg : history) {
                String role = msg.getSender() == Message.Sender.USER ? "user" : "model";
                contents.add(Map.of("role", role, "parts", List.of(Map.of("text", msg.getContent()))));
            }
        } else {
            // No history yet — add placeholder model response so turns alternate correctly
            contents.add(Map.of("role", "model", "parts", List.of(Map.of("text", "Spreman sam. Iznesite vaš argument."))));
        }

        // New user message
        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", userMessage))));
        return contents;
    }

    private String callGemini(String prompt) {
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
            "generationConfig", Map.of("temperature", 0.8, "maxOutputTokens", 512)
        );
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String url = apiUrl + "?key=" + apiKey;
        log.info("Gemini single-turn poziv -> URL: {}?key=...", apiUrl);
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(requestBody, headers), Map.class);
            log.info("Gemini single-turn odgovor: HTTP {}", response.getStatusCode());
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return extractText(response.getBody());
            }
            log.error("Gemini single-turn ne-2xx: {}, body: {}", response.getStatusCode(), response.getBody());
        } catch (HttpClientErrorException e) {
            log.error("Gemini single-turn HTTP greška {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Gemini single-turn exception: {} - {}", e.getClass().getSimpleName(), e.getMessage());
        }
        return null;
    }

    private String callGeminiMultiTurn(List<Map<String, Object>> contents) {
        Map<String, Object> requestBody = Map.of(
            "contents", contents,
            "generationConfig", Map.of("temperature", 0.85, "maxOutputTokens", 512)
        );
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String url = apiUrl + "?key=" + apiKey;
        log.info("Gemini multi-turn poziv -> URL: {}?key=..., turns: {}, roles: {}",
                apiUrl, contents.size(),
                contents.stream().map(c -> (String) c.get("role")).toList());
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(requestBody, headers), Map.class);
            log.info("Gemini multi-turn odgovor: HTTP {}", response.getStatusCode());
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return extractText(response.getBody());
            }
            log.error("Gemini multi-turn ne-2xx: {}, body: {}", response.getStatusCode(), response.getBody());
        } catch (HttpClientErrorException e) {
            log.error("Gemini multi-turn HTTP greška {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Gemini multi-turn exception: {} - {}", e.getClass().getSimpleName(), e.getMessage(), e);
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Integer> parseScores(String raw) {
        String cleaned = raw.trim();
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) cleaned = cleaned.substring(start, end + 1);
        try {
            Map<String, Object> parsed = objectMapper.readValue(cleaned, Map.class);
            return Map.of(
                "argumentacija", clamp(parsed.get("argumentacija")),
                "empatija",      clamp(parsed.get("empatija")),
                "retorika",      clamp(parsed.get("retorika")),
                "prilagodjenost",clamp(parsed.get("prilagodjenost"))
            );
        } catch (Exception e) {
            log.error("Greška pri parsiranju ocjena: {}", e.getMessage());
            return Map.of("argumentacija", 6, "empatija", 6, "retorika", 6, "prilagodjenost", 6);
        }
    }

    private int clamp(Object val) {
        if (val == null) return 6;
        return Math.max(1, Math.min(10, ((Number) val).intValue()));
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> body) {
        try {
            var candidates = (List<Map<String, Object>>) body.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                var content = (Map<String, Object>) candidates.get(0).get("content");
                var parts   = (List<Map<String, Object>>) content.get("parts");
                if (parts != null && !parts.isEmpty()) return (String) parts.get(0).get("text");
            }
        } catch (Exception e) {
            log.error("Greška pri parsiranju Gemini odgovora: {}", e.getMessage());
        }
        return null;
    }
}

