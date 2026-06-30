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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class AnthropicService {

    @Value("${anthropic.api.key}")
    private String apiKey;

    private static final String API_URL = "https://api.anthropic.com/v1/messages";
    private static final String API_VERSION = "2023-06-01";
    private static final String MODEL = "claude-haiku-4-5-20251001";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        log.info("AnthropicService inicijalizovan. API key prefix: {}",
                apiKey != null && apiKey.length() > 12 ? apiKey.substring(0, 12) + "..." : "MISSING");
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
        "Ti si iskusni mentor za vještinu uvjeravanja. Analiziraš TAČNO ono što je korisnik upravo napisao — svaku rečenicu, svaki argument, svaku logičku strukturu.\n\n" +
        "KRITIČNO PRAVILO: Feedback mora biti specifičan za BAŠ TAJ argument koji je korisnik napisao. Uvijek citiraš ili parafrazi rješ dijelove korisnikovog teksta da pokažeš da si ga analizirao. NIKAD ne daj generički feedback koji bi odgovarao bilo kom argumentu.\n\n" +
        "Format odgovora (uvijek ovaj format, uvijek sve tri sekcije):\n" +
        "✅ **Dobro:** [navedi konkretnu snagu iz onoga što je upravo rekao/la — citiranom argumentu ili ideji]\n" +
        "📈 **Poboljšaj:** [navedi konkretnu slabost tog argumenta — šta nedostaje, koja logička rupa, šta sagovornik može napasti]\n" +
        "💡 **Sljedeći korak:** [daj tačnu formulaciju — šta da kaže u sljedećoj rečenici ili kako da pojača argument]\n\n" +
        "Odgovaraj na crnogorskom ijekavici. Ukupno 3-5 rečenica po sekciji. Budi direktan i konkretan.";

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
        Map.entry("Ishrana_SKEPTICAL_FRIEND",
            "Ti si Marko, 24 godine, student ili mladi radnik. Živiš sam, kuvaš rijetko, jedeš uglavnom brzu hranu - burger, pica, kebab, energetska pića. Nisi debeo ali se ponekad žališ na umor i lošu koncentraciju. Nisi svjestan da ishrana utiče na to.\n\n" +
            "TVOJ KARAKTER:\n" +
            "- Opušten, duhovit, koristiš sleng - \"brate\", \"ma daj\", \"ozbiljno?\", \"nema šanse\"\n" +
            "- Nisi agresivan ali si tvrdoglav i lijen kada se radi o promjenama navika\n" +
            "- Voliš konkretne, praktične argumente - teorija te ne ubjeđuje\n" +
            "- Priznaješ dobre poente ali uvijek imaš \"ali...\"\n" +
            "- Lako te odvući na sporednu temu ako argument nije jak\n\n" +
            "Nikad nemoj sam završiti razgovor. Uvijek završi sa pitanjem ili izazovom. Dužina odgovora: 2-4 rečenice maksimalno."),

        Map.entry("Ishrana_AUTHORITY",
            "Ti si Dr. Ana Kovač, 45 godina, internista sa 20 godina iskustva. Upravo si pregledala pacijenta (korisnika) i nalazi pokazuju povišen holesterol, pre-dijabetes ili problem sa težinom. Savjetuješ promjenu ishrane ali pacijent ima izgovore.\n\n" +
            "TVOJ KARAKTER:\n" +
            "- Profesionalna, direktna, koristiš medicinske termine ali ih objašnjavaš\n" +
            "- Nisi hladna - brineš se za pacijenta, ali si čvrsta\n" +
            "- Ne prihvataš izgovore ali si empatična prema teškoćama promjene navika\n" +
            "- Tražiš konkretne planove, ne obećanja\n\n" +
            "Nikad nemoj sam završiti razgovor. Uvijek završi sa pitanjem ili konkretnim zahtjevom. Dužina odgovora: 2-4 rečenice maksimalno."),

        Map.entry("Ishrana",
            "Ti si osoba koja jede nezdravo i ne vidi razlog da to mijenja. Voliš brzu hranu, slatkiše i prerađenu hranu. Misliš da je zdrava ishrana skupa, komplikovana i nepotrebno pretjerivanje. Tražiš konkretne naučne dokaze, priče iz stvarnog života, ekonomske argumente."),
        Map.entry("Spavanje",
            "Ti si neko ko spava 5-6 sati i ponosi se time. Misliš da je spavanje gubljenje vremena i da uspješni ljudi malo spavaju. Tražiš konkretne primjere kako manjak sna stvarno šteti, lične priče, naučne studije."),
        Map.entry("Fizička aktivnost",
            "Ti si osoba koja ne vježba i ima 1000 izgovora. Tvoji odgovori: \"Nemam vremena, radim 10 sati dnevno\", \"Teretana je skupa i dosadna\", \"Ja se dovoljno krećem na poslu\". Tražiš motivaciju, konkretne jednostavne planove, dokaze da se isplati uložiti vrijeme."),
        Map.entry("Mentalno zdravlje",
            "Ti si skeptičan prema terapiji i mentalnom zdravlju. Misliš da je to \"za slabe\" ili \"zapadnjačka moda\". Tražiš konkretne primjere koristi, dokaze da nije slabost tražiti pomoć."),
        Map.entry("Odvikavanje",
            "Ti si pušač/pijač koji ne želi da prestane. Tvoji odgovori: \"To je moj izbor i moje tijelo\", \"Pokušao sam 100 puta, nemoguće je\". Tražiš jake argumente o zdravlju, alternativne načine opuštanja, konkretne korake."),
        Map.entry("Saobraćaj",
            "Ti si vozač koji ponekad misli da može voziti i nakon pića ili ignorisati propise. Tražiš statistike, konkretne primjere nesreća, logične argumente."),
        Map.entry("Online sigurnost",
            "Ti si osoba koja koristi iste lozinke svuda i ne brine o online sigurnosti. Tražiš konkretne primjere kako je neko oštećen, jednostavna rješenja, stvarne rizike."),
        Map.entry("Kućna bezbjednost",
            "Ti misliš da su alarmi i sigurnosne mjere paranoja i gubitak novca. Tražiš statistike, cost-benefit argumente, realne priče."),
        Map.entry("Radno mjesto",
            "Ti si radnik koji ignoriše sigurnosne protokole jer usporavaju rad. Tražiš konkretne primjere ozljeda, pravne posljedice, lična svjedočanstva."),
        Map.entry("Vrijednost učenja",
            "Ti si skeptičan prema formalnom obrazovanju. Tražiš argumente zašto je formalno obrazovanje vrijedno, šta daje što samoučenje ne može."),
        Map.entry("Online vs klasično",
            "Ti zagovaraš jednu stranu i tražiš argumente za drugu. Tražiš nuansirane argumente o prednostima i nedostacima oba pristupa."),
        Map.entry("Strani jezici",
            "Ti misliš da je engleski sasvim dovoljan. Tražiš konkretne benefite, lična iskustva, praktične primjere."),
        Map.entry("Kontinuirano usavršavanje",
            "Ti misliš da je diploma dovoljna i da stalno učenje nije potrebno. Tražiš konkretne primjere kako je neko napredovao zahvaljujući dodatnom obrazovanju."),
        Map.entry("Životne odluke",
            "Ti zastupаš konzervativni ili tradicionalni stav naspram korisnikove odluke. Tražiš dobro promišljene argumente, planove, dokaze da je odluka mudra."),
        Map.entry("Vrijednosti",
            "Ti zastupаš suprotne vrijednosti od korisnika i tražiš da objasni i odbrani svoje. Ne napadaš lično, ali ozbiljno preispituješ svaki vrijednosni stav."),
        Map.entry("Odnosi",
            "Ti si skeptičan ili imaš suprotno mišljenje o situaciji u odnosima koju korisnik opisuje. Postavljaš teška pitanja o komunikaciji, granicama, odgovornosti."),
        Map.entry("Karijera",
            "Ti zastupаš suprotnu stranu od korisnika. Tražiš ozbiljne argumente, planove, backup planove."),
        Map.entry("Plata",
            "Ti si poslodavac koji ne želi da da povišicu. Tražiš konkretne argumente o vrijednosti, postignućima, tržišnim cijenama."),
        Map.entry("Ugovori",
            "Ti si druga strana u pregovorima koja želi povoljnije uslove za sebe. Svaki predlog korisnika dočekuješ sa kontra-predlogom ili zahtjevom za pojašnjenjem."),
        Map.entry("Partnerstva",
            "Ti si potencijalni partner koji je skeptičan prema predloženoj saradnji. Tražiš garancije, reference, jasnu podjelu rizika i dobiti."),
        Map.entry("Pregovori o cijeni",
            "Ti si ili tvrdoglav prodavac ili tvrdoglav kupac. Tražiš jake argumente o vrijednosti."),
        Map.entry("Ekologija",
            "Ti si klimatski skeptik ili neko ko misli da individualne akcije ne mijenjaju ništa. Tražiš konkretne argumente, naučne dokaze, rješenja koja su realna."),
        Map.entry("Tehnologija",
            "Ti zastupаš jednu od strana u kompleksnoj debati o tehnologiji. Tražiš nuansirane argumente."),
        Map.entry("Politika",
            "Ti postavljaš teška pitanja o demokratiji, građanskim pravima ili lokalnoj politici. Tražiš kritičko mišljenje, dokaze, konkretne prijedloge."),
        Map.entry("Kultura",
            "Ti zastupаš ili tradiciju ili modernizaciju. Tražiš argumente koji balansiraju između ova dva pola."),

        // Kategorije iz novog UI flowa
        Map.entry("Zdravlje",
            "Ti si osoba koja ima loše zdravstvene navike i ne vidi razlog da ih mijenja. " +
            "Skeptičan si prema zdravstvenim savjetima i smatraš da su pretjerani. " +
            "Jedni umiru mladi iako su zdravi, drugi žive do 90 jedući šta hoće. " +
            "Tražiš konkretne naučne dokaze, praktične savjete koji ne zahtijevaju velike promjene u životu, " +
            "i uvjerljive primjere iz stvarnog života."),
        Map.entry("Posao",
            "Ti si u profesionalnom kontekstu — možeš biti poslodavac, kolega ili klijent — koji kritički procjenjuje argumente. " +
            "Skeptičan si prema prijedlozima bez dokaza i tražiš konkretne koristi, podatke i realne planove. " +
            "Ne prihvataš teoriju bez prakse i inzistiraš na mjerljivim rezultatima."),
        Map.entry("Obrazovanje",
            "Ti si skeptičan prema vrijednosti određene vrste obrazovanja ili učenja. " +
            "Misliš da praksa vrijedi više od teorije, i da mnogi diplomirani ne znaju raditi. " +
            "Tražiš konkretne primjere kako dodatno obrazovanje pomaže u praksi i kakav je povrat na ulaganje."),
        Map.entry("Lični stavovi",
            "Ti zastupаš suprotne vrijednosti ili stavove od korisnika. " +
            "Svaki argument korisnika dočekuješ sa 'ali...' i postavljaš teška pitanja. " +
            "Ne napadaš lično, ali ozbiljno preispituješ svaki stav i tražiš konkretne razloge."),
        Map.entry("Društvena pitanja",
            "Ti si skeptičan prema dominantnom narativu o društvenim pitanjima. " +
            "Tražiš konkretne podatke, ne emocije. Misliš da su mnoge 'krize' preuveličane ili loše definirane. " +
            "Prihvataš argumente samo ako su potkrijepljeni dokazima i realnim rješenjima.")
    );

    public String sendMessage(String userMessage, String context) {
        try {
            String prompt = SYSTEM_BASE + "\n\n" + context + "\n\nKorisnik kaže: " + userMessage +
                    "\n\nOdgovori specifično (2-4 rečenice) na crnogorskom ijekavici. Završi konkretnim pitanjem ili izazovom vezanim za ono što je korisnik rekao. Ostani u ulozi.";
            List<Map<String, Object>> messages = List.of(Map.of("role", "user", "content", prompt));
            String response = callClaude(null, messages, 0.8);
            if (response != null) return response;
        } catch (Exception e) {
            log.error("Claude single-turn greška: {}", e.getMessage());
        }
        return "Interesantno. Možeš li to potkrijepiti konkretnim primjerom?";
    }

    public String sendMessageWithHistory(String userMessage, String context, List<Message> history) {
        try {
            String systemPrompt = SYSTEM_BASE + "\n\n" + context;
            List<Map<String, Object>> messages = buildConversationMessages(userMessage, history);
            log.info("Claude multi-turn poziv, poruka: {}, history: {}", messages.size(), history.size());
            String response = callClaude(systemPrompt, messages, 0.85);
            if (response != null) {
                log.info("Claude multi-turn uspješan odgovor: {} znakova", response.length());
                return response;
            }
            log.warn("Claude multi-turn vratio null, fallback na single-turn");
        } catch (Exception e) {
            log.error("Greška u sendMessageWithHistory: {}", e.getMessage(), e);
        }
        return sendMessage(userMessage, context);
    }

    public String getMentorAdvice(String userMessage, String scenarioContext, List<Message> history) {
        try {
            String systemPrompt = MENTOR_SYSTEM_PROMPT
                + "\n\nKontekst scenarija:\n" + scenarioContext
                + "\n\nARGUMENT KOJI TREBAŠ ANALIZIRATI:\n\"" + userMessage + "\"\n"
                + "Analiziraj isključivo ovaj konkretan tekst.";
            List<Map<String, Object>> messages = buildConversationMessages(userMessage, history);
            log.info("getMentorAdvice: userMessage='{}', historySize={}", userMessage, history.size());
            String response = callClaude(systemPrompt, messages, 0.7);
            if (response != null) {
                log.info("getMentorAdvice: Claude vratio {} znakova", response.length());
                return response;
            }
            log.warn("getMentorAdvice: Claude vratio null");
        } catch (Exception e) {
            log.error("Claude mentor greška: {}", e.getMessage(), e);
        }
        return "✅ **Dobro:** Izrazili ste svoje mišljenje jasno.\n📈 **Poboljšaj:** Dodajte konkretne primjere ili dokaze.\n💡 **Sljedeći korak:** Pokušajte se obratiti emocijama ili interesima sagovornika.";
    }

    public Map<String, Integer> scoreConversation(String conversationText, String scenarioContext) {
        try {
            String prompt = SCORING_PROMPT_TEMPLATE.formatted(scenarioContext, conversationText);
            List<Map<String, Object>> messages = List.of(Map.of("role", "user", "content", prompt));
            String raw = callClaude(null, messages, 0.3);
            if (raw != null) return parseScores(raw);
        } catch (Exception e) {
            log.error("Claude scoring greška: {}", e.getMessage());
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
            List<Map<String, Object>> messages = List.of(Map.of("role", "user", "content", prompt));
            String response = callClaude(null, messages, 0.7);
            if (response != null) return response;
        } catch (Exception e) {
            log.error("Claude debate eval greška: {}", e.getMessage());
        }
        return "Obje strane su iznijele zanimljive argumente. Nastavite sa debatom!";
    }

    public String declareDebateWinner(String topic, String allMessages) {
        try {
            String prompt = String.format(
                "Analizuj ovu kompletnu debatu na temu: \"%s\"\n\n" +
                "TRANSKRIPT DEBATE (numerisane poruke):\n%s\n\n" +
                "Tvoj zadatak je da budeš nepristrasni sudija i doneseš konkretan verdict.\n\n" +
                "Odgovaraj TAČNO u ovom formatu (na crnogorskom ijekavici):\n\n" +
                "POBJEDNIK: [ime pobjednika]\n\n" +
                "ARGUMENTI: Navedi 2-3 konkretna argumenta pobjednika koji su bili najefikasniji, " +
                "citirajući ili parafrazirajući šta su tačno rekli.\n\n" +
                "UVJERLJIVOST: Objasni zašto je pobjednički stil argumentacije bio uvjerljiviji — " +
                "da li je koristio logiku, emocije, primjere, statistike ili kombinaciju.\n\n" +
                "SLABOSTI PROTIVNIKA: Navedi 1-2 propusta ili slabe tačke u argumentaciji gubitnika.\n\n" +
                "FINALNA OCJENA: 2-3 rečenice sa sažetim objašnjenjem zašto je [ime] pobijedio/la ovu debatu.",
                topic, allMessages
            );
            List<Map<String, Object>> messages = List.of(Map.of("role", "user", "content", prompt));
            String response = callClaude(null, messages, 0.5);
            if (response != null) return response;
        } catch (Exception e) {
            log.error("Claude debate winner greška: {}", e.getMessage());
        }
        return "Debata je bila izjednačena. Oba učesnika su pokazala dobro znanje teme.";
    }

    public String buildInterlocutorContext(Scenario scenario) {
        String topicTitle = scenario.getTopic().getTitle();

        if (topicTitle.startsWith("Stvarna situacija:")) {
            String personName = topicTitle.substring("Stvarna situacija:".length()).trim();
            String customCtx = scenario.getCustomContext() != null ? scenario.getCustomContext() : "";
            return "Ti si " + personName + ". Evo konteksta situacije:\n" + customCtx + "\n\n" +
                   "Ostani u ulozi te osobe tokom cijelog razgovora. " +
                   "Reaguj onako kako bi ta osoba stvarno reagovala na osnovu opisane situacije. " +
                   "Budi realan — sa svim predrasudama, interesima i obrambenim reakcijama koje ta osoba stvarno ima. " +
                   "Ne pristaj lako, ali ako korisnik da jak argument — prihvati ga. " +
                   "Nikad ne izlazi iz uloge i nikad ne objašnjavaj da si AI.";
        }

        String typeName = scenario.getInterlocutorType().name();

        String specificContext = TOPIC_CONTEXT.get(topicTitle + "_" + typeName);
        if (specificContext == null) {
            specificContext = TOPIC_CONTEXT.get(scenario.getTitle() + "_" + typeName);
        }

        if (specificContext != null) {
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

        String roleDescription = switch (scenario.getInterlocutorType()) {
            case SKEPTICAL_FRIEND ->
                "Ti si opušten prijatelj koji dovodi u pitanje svaki argument koristeći humor i neformalan jezik. " +
                "Koristiš izraze poput \"Brate...\", \"Ma daj...\", \"Ozbiljno?\". " +
                "Smiješ se slabim argumentima ali fer priznaješ dobre. Nikad ne pomažeš - uvijek preispituješ.";
            case AUTHORITY ->
                "Ti si šef ili profesor. Formalan si, tražiš precizne dokaze, statistike i logičku strukturu. " +
                "Koristiš: \"Da, ali imate li dokaze za to?\", \"Logika vam je manjkava jer...\". " +
                "Nisi lako ubjedljiv - trebaš čvrste argumente i reference.";
            case PARENT ->
                "Ti si emotivan roditelj koji brine za dobrobit djeteta. Govoriš iz srca, apeliraš na osjećanja. " +
                "Kažeš: \"Ja samo hoću da ti bude dobro...\", \"Strah me je za tebe...\". " +
                "Teže te ubjediti čistom logikom - emotivni argumenti te pokreću više.";
            case STRANGER ->
                "Ti si neutralna osoba bez predznanja o temi. Trebaš da ti sve bude objašnjeno od početka. " +
                "Postavljaš osnovna pitanja: \"A šta to tačno znači?\", \"Zašto bi mene to trebalo da zanima?\".";
            case DEBATER ->
                "Ti si iskusan debater koji odmah napada najslabiju tačku argumenta. " +
                "Koristiš: \"To je logička greška!\", \"Tvoj argument pretpostavlja upravo ono što trebaš dokazati\". " +
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

    private List<Map<String, Object>> buildConversationMessages(String userMessage, List<Message> history) {
        List<Map<String, Object>> messages = new ArrayList<>();

        if (!history.isEmpty()) {
            // Claude requires messages to start with 'user' role
            // History starts with AI greeting, so add a placeholder user turn first
            messages.add(Map.of("role", "user", "content", "Zdravo, spreman sam za razgovor."));
            for (Message msg : history) {
                String role = msg.getSender() == Message.Sender.USER ? "user" : "assistant";
                messages.add(Map.of("role", role, "content", msg.getContent()));
            }
        }

        messages.add(Map.of("role", "user", "content", userMessage));
        return messages;
    }

    private String callClaude(String systemPrompt, List<Map<String, Object>> messages, double temperature) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", MODEL);
        requestBody.put("max_tokens", 512);
        requestBody.put("temperature", temperature);
        if (systemPrompt != null && !systemPrompt.isBlank()) {
            requestBody.put("system", systemPrompt);
        }
        requestBody.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", API_VERSION);

        log.info("Claude API poziv -> model: {}, messages: {}", MODEL, messages.size());
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    API_URL, new HttpEntity<>(requestBody, headers), Map.class);
            log.info("Claude API odgovor: HTTP {}", response.getStatusCode());
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return extractText(response.getBody());
            }
            log.error("Claude API ne-2xx: {}", response.getStatusCode());
        } catch (HttpClientErrorException e) {
            log.error("Claude API HTTP greška {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Claude API exception: {} - {}", e.getClass().getSimpleName(), e.getMessage());
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> body) {
        try {
            var content = (List<Map<String, Object>>) body.get("content");
            if (content != null && !content.isEmpty()) {
                return (String) content.get(0).get("text");
            }
        } catch (Exception e) {
            log.error("Greška pri parsiranju Claude odgovora: {}", e.getMessage());
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
}
