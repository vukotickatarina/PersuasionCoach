package com.persuasioncoach.init;

import com.persuasioncoach.entity.*;
import com.persuasioncoach.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final ScenarioRepository scenarioRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final LearningPlanRepository learningPlanRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private DataSource dataSource;

    @PersistenceContext
    private EntityManager entityManager;

    /** Uklanja NOT NULL constraint sa scenario_id van JPA transakcije, putem zasebnog JDBC connection-a. */
    private void dropScenarioIdNotNull() {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            conn.setAutoCommit(true);
            stmt.execute("ALTER TABLE conversation_sessions ALTER COLUMN scenario_id DROP NOT NULL");
            log.info("Uklonjen NOT NULL constraint sa conversation_sessions.scenario_id");
        } catch (Exception e) {
            log.debug("ALTER TABLE scenario_id skipped (vjerovatno već nullable): {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public void run(String... args) {
        dropScenarioIdNotNull();
        refreshTopicsAndScenarios();

        if (userRepository.count() == 0) {
            log.info("Inicijalizacija korisnika i badges...");
            User admin = createAdmin();
            User testUser = createTestUser();
            List<Badge> badges = createBadges();
            createLearningPlan(testUser);
            createNotifications(testUser);
            awardInitialBadges(testUser, badges);
            log.info("Admin: admin@persuasioncoach.com / admin123");
            log.info("Test korisnik: test@persuasioncoach.com / test123");
        }
    }

    private void refreshTopicsAndScenarios() {
        long rootCount = topicRepository.countByParentIdIsNull();
        if (rootCount == 6 && topicRepository.count() > 20) {
            log.info("Teme su već inicijalizovane sa novom strukturom");
            return;
        }
        log.info("Osvježavam strukturu tema i scenarija...");

        entityManager.createNativeQuery("ALTER TABLE scenarios DROP CONSTRAINT IF EXISTS scenarios_interlocutor_type_check").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM feedbacks").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM analyses").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM messages").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM conversation_sessions").executeUpdate();
        scenarioRepository.deleteAll();
        entityManager.createNativeQuery("DELETE FROM topics").executeUpdate();
        entityManager.flush();

        List<Topic> categories = createCategories();
        createSubcategoriesAndScenarios(categories);
        log.info("Inicijalizacija završena! Kreirano {} kategorija", categories.size());
    }

    private User createAdmin() {
        User admin = User.builder()
                .name("Administrator")
                .email("admin@persuasioncoach.com")
                .password(passwordEncoder.encode("admin123"))
                .role(User.Role.ADMIN)
                .experienceLevel(User.ExperienceLevel.ADVANCED)
                .language("Crnogorski")
                .build();
        admin.getInterests().addAll(List.of("Javni govor", "Liderstvo"));
        return userRepository.save(admin);
    }

    private User createTestUser() {
        User user = User.builder()
                .name("Ana Kovačević")
                .email("test@persuasioncoach.com")
                .password(passwordEncoder.encode("test123"))
                .experienceLevel(User.ExperienceLevel.INTERMEDIATE)
                .language("Crnogorski")
                .build();
        user.getInterests().addAll(List.of("Javni govor", "Pregovaranje", "Debate"));
        return userRepository.save(user);
    }

    private List<Badge> createBadges() {
        List<Badge> badges = List.of(
                Badge.builder().name("Prva vježba").description("Uspješno ste završili svoju prvu vježbu. Svako putovanje počinje prvim korakom!").condition("Završi 1 vježbu").build(),
                Badge.builder().name("7-dnevni niz").description("Vježbali ste 7 uzastopnih dana. Disciplina je ključ uspjeha!").condition("Vježbaj 7 dana zaredom").build(),
                Badge.builder().name("Precizan").description("Postigli ste ocjenu argumentacije 90%+ u jednoj sesiji.").condition("Argumentacija ≥ 90% u sesiji").build(),
                Badge.builder().name("10 vježbi").description("Završili ste ukupno 10 vježbi.").condition("Završi 10 vježbi ukupno").build(),
                Badge.builder().name("25 vježbi").description("Završili ste 25 vježbi. Pravi profesionalac!").condition("Završi 25 vježbi ukupno").build(),
                Badge.builder().name("Pobjednik").description("Dospijte na 1. mjesto rang liste u izazovu.").condition("Osvoji 1. mjesto u izazovu").build(),
                Badge.builder().name("Debater").description("Završite 5 debatnih scenarija s ocjenom uvjerljivosti ≥ 80%.").condition("5 debata, uvjerljivost ≥ 80%").build()
        );
        return badgeRepository.saveAll(badges);
    }

    private List<Topic> createCategories() {
        List<Topic> cats = List.of(
                Topic.builder().title("Zdrave navike").description("Uvjerite nekoga da promijeni životne navike i usvoji zdraviji način života").difficulty(Topic.Difficulty.EASY).popular(true).build(),
                Topic.builder().title("Bezbjednost").description("Argumentujte važnost sigurnosnih mjera u svakodnevnom životu").difficulty(Topic.Difficulty.MEDIUM).popular(false).build(),
                Topic.builder().title("Obrazovanje").description("Raspravljajte o vrijednosti učenja i obrazovanja").difficulty(Topic.Difficulty.EASY).popular(true).build(),
                Topic.builder().title("Lični stavovi").description("Branite vlastite životne odluke i vrijednosti pred drugima").difficulty(Topic.Difficulty.HARD).popular(false).build(),
                Topic.builder().title("Poslovna pregovaranja").description("Pregovarajte o cijeni, plati i poslovnim uslovima").difficulty(Topic.Difficulty.HARD).popular(true).build(),
                Topic.builder().title("Društvena pitanja").description("Diskutujte o aktuelnim temama koje utiču na društvo").difficulty(Topic.Difficulty.MEDIUM).popular(false).build()
        );
        return topicRepository.saveAll(cats);
    }

    private void createSubcategoriesAndScenarios(List<Topic> categories) {
        Topic zdravlje = categories.get(0);
        Topic bezbjednost = categories.get(1);
        Topic obrazovanje = categories.get(2);
        Topic licni = categories.get(3);
        Topic posao = categories.get(4);
        Topic drustvo = categories.get(5);

        // Zdrave navike
        Topic ishrana = sub("Ishrana", "Pravilna ishrana i zdrava prehrana", zdravlje, Topic.Difficulty.EASY);
        Topic spavanje = sub("Spavanje", "Važnost kvalitetnog sna i odmora", zdravlje, Topic.Difficulty.EASY);
        Topic fizicka = sub("Fizička aktivnost", "Redovno vježbanje i fizička aktivnost", zdravlje, Topic.Difficulty.EASY);
        Topic mentalno = sub("Mentalno zdravlje", "Briga o mentalnom zdravlju i emocijama", zdravlje, Topic.Difficulty.MEDIUM);
        Topic odvikavanje = sub("Odvikavanje", "Odvikavanje od loših navika i zavisnosti", zdravlje, Topic.Difficulty.HARD);

        // Bezbjednost
        Topic saobracaj = sub("Saobraćaj", "Bezbjednost u saobraćaju i sigurna vožnja", bezbjednost, Topic.Difficulty.MEDIUM);
        Topic online = sub("Online sigurnost", "Zaštita privatnosti i bezbjednost na internetu", bezbjednost, Topic.Difficulty.MEDIUM);
        Topic kucna = sub("Kućna bezbjednost", "Sigurnost doma i zaštita porodice", bezbjednost, Topic.Difficulty.EASY);
        Topic radnoMjesto = sub("Radno mjesto", "Bezbjednost i higijena na radnom mjestu", bezbjednost, Topic.Difficulty.MEDIUM);

        // Obrazovanje
        Topic vrijednostUcenja = sub("Vrijednost učenja", "Zašto je učenje ključno za lični razvoj", obrazovanje, Topic.Difficulty.EASY);
        Topic onlineVsKlasicno = sub("Online vs klasično", "Prednosti i mane online i klasičnog obrazovanja", obrazovanje, Topic.Difficulty.MEDIUM);
        Topic straniJezici = sub("Strani jezici", "Važnost učenja stranih jezika u savremenom dobu", obrazovanje, Topic.Difficulty.EASY);
        Topic kontinuiranoUsav = sub("Kontinuirano usavršavanje", "Cjeloživotno učenje i profesionalni razvoj", obrazovanje, Topic.Difficulty.MEDIUM);

        // Lični stavovi
        Topic zivotneOdluke = sub("Životne odluke", "Branite svoje životne izbore pred porodicom i prijatljima", licni, Topic.Difficulty.HARD);
        Topic vrijednosti = sub("Vrijednosti", "Govorite o temeljnim životnim vrijednostima", licni, Topic.Difficulty.HARD);
        Topic odnosi = sub("Odnosi", "Razgovarajte o međuljudskim odnosima i vezama", licni, Topic.Difficulty.MEDIUM);
        Topic karijera = sub("Karijera", "Branite svoju karijernu odluku i profesionalni put", licni, Topic.Difficulty.HARD);

        // Poslovna pregovaranja
        Topic plata = sub("Plata", "Pregovarajte o visini plate i beneficijama", posao, Topic.Difficulty.HARD);
        Topic ugovori = sub("Ugovori", "Pregovarajte o uslovima poslovnih ugovora", posao, Topic.Difficulty.HARD);
        Topic partnerstva = sub("Partnerstva", "Uspostavite povoljno poslovno partnerstvo", posao, Topic.Difficulty.HARD);
        Topic pregovoriCijena = sub("Pregovori o cijeni", "Pregovarajte o cijeni proizvoda ili usluge", posao, Topic.Difficulty.MEDIUM);

        // Društvena pitanja
        Topic ekologija = sub("Ekologija", "Zagovarajte zaštitu okoliša i ekološke mjere", drustvo, Topic.Difficulty.MEDIUM);
        Topic tehnologija = sub("Tehnologija", "Diskutujte o uticaju tehnologije na društvo", drustvo, Topic.Difficulty.MEDIUM);
        Topic politika = sub("Politika", "Raspravljajte o aktuelnim političkim pitanjima", drustvo, Topic.Difficulty.HARD);
        Topic kultura = sub("Kultura", "Govorite o kulturnim razlikama i tradicijama", drustvo, Topic.Difficulty.EASY);

        topicRepository.saveAll(List.of(
                ishrana, spavanje, fizicka, mentalno, odvikavanje,
                saobracaj, online, kucna, radnoMjesto,
                vrijednostUcenja, onlineVsKlasicno, straniJezici, kontinuiranoUsav,
                zivotneOdluke, vrijednosti, odnosi, karijera,
                plata, ugovori, partnerstva, pregovoriCijena,
                ekologija, tehnologija, politika, kultura
        ));

        createScenarios(
                ishrana, spavanje, fizicka, mentalno, odvikavanje,
                saobracaj, online, kucna, radnoMjesto,
                vrijednostUcenja, onlineVsKlasicno, straniJezici, kontinuiranoUsav,
                zivotneOdluke, vrijednosti, odnosi, karijera,
                plata, ugovori, partnerstva, pregovoriCijena,
                ekologija, tehnologija, politika, kultura
        );
    }

    private Topic sub(String title, String desc, Topic parent, Topic.Difficulty difficulty) {
        return Topic.builder()
                .title(title).description(desc)
                .difficulty(difficulty).parentId(parent.getId()).build();
    }

    private void createScenarios(
            Topic ishrana, Topic spavanje, Topic fizicka, Topic mentalno, Topic odvikavanje,
            Topic saobracaj, Topic online, Topic kucna, Topic radnoMjesto,
            Topic vrijednostUcenja, Topic onlineVsKlasicno, Topic straniJezici, Topic kontinuiranoUsav,
            Topic zivotneOdluke, Topic vrijednosti, Topic odnosi, Topic karijera,
            Topic plata, Topic ugovori, Topic partnerstva, Topic pregovoriCijena,
            Topic ekologija, Topic tehnologija, Topic politika, Topic kultura) {

        List<Scenario> scenarios = List.of(
                // ISHRANA
                scen(ishrana, "Ubijedi prijatelja da jede zdravije", "Tvoj prijatelj jede nezdravo i stalno se žali na energiju. Pokušaj ga ubjediti da promijeni prehrambene navike.",
                        Scenario.InterlocutorType.SKEPTICAL_FRIEND, "Opušten prijatelj koji voli brzu hranu i skeptičan je prema zdravoj ishrani"),
                scen(ishrana, "Razgovor sa doktorom o dijeti", "Doktor ti savjetuje promjenu ishrane zbog zdravstvenih razloga. Argumentuj zašto je to teško i pregovaraj o pristupu.",
                        Scenario.InterlocutorType.AUTHORITY, "Iskusan doktor koji inzistira na zdravoj prehrani i ima medicinske dokaze"),

                // SPAVANJE
                scen(spavanje, "Ubijedi šefa za fleksibilno radno vrijeme", "Hočeš da radiš od 10h umjesto od 8h jer spavanjem noću radiš bolje. Ubijedi šefa.",
                        Scenario.InterlocutorType.AUTHORITY, "Šef koji cijeni tačnost i standardno radno vrijeme, traži opravdanje"),
                scen(spavanje, "Razgovor sa roditeljom o kasnom spavanju", "Roditelj brine što kasno ideš spati i voli da te budi rano. Objasni mu važnost tvog ritma spavanja.",
                        Scenario.InterlocutorType.PARENT, "Zabrinut roditelj koji misli da kasno spavanje znači lijenost"),

                // FIZIČKA AKTIVNOST
                scen(fizicka, "Motiviši prijatelja da počne vježbati", "Prijatelj nema energije i stalno odlaže vježbanje. Ubijedi ga da krene.",
                        Scenario.InterlocutorType.SKEPTICAL_FRIEND, "Prijatelj koji smatra da nema vremena i energije za vježbanje"),
                scen(fizicka, "Objasni strancu benefite sporta", "Na seminaru zdravlja trebaš objasniti potpunom strancu zašto je redovna fizička aktivnost ključna.",
                        Scenario.InterlocutorType.STRANGER, "Neutralna osoba koja nikad nije razmišljala ozbiljno o sportu"),

                // MENTALNO ZDRAVLJE
                scen(mentalno, "Ubijedi roditelja da terapija nije slabost", "Tvoj roditelj smatra da je psiholog za 'slabe'. Objasni mu važnost mentalnog zdravlja.",
                        Scenario.InterlocutorType.PARENT, "Roditelj starog kova koji smatra da se problemi rješavaju sami"),
                scen(mentalno, "Raspravi o stresu na poslu sa kolegom", "Kolega misli da je stres na poslu normalan. Ubijedi ga da treba praviti granice.",
                        Scenario.InterlocutorType.DEBATER, "Iskusan kolega koji tvrdi da je stres znak angažovanosti"),

                // ODVIKAVANJE
                scen(odvikavanje, "Ubijedi prijatelja da ostavi cigarete", "Prijatelj puši godinama i ne vidi razlog da prestane. Pomozi mu argumentima.",
                        Scenario.InterlocutorType.SKEPTICAL_FRIEND, "Dugogodišnji pušač koji ne vidi hitnost, ima kontraargumente"),
                scen(odvikavanje, "Razgovor s roditeljom o alkoholu", "Brinuš se za roditeljevo konzumiranje alkohola. Pokušaj ga uvjeriti da potraži pomoć.",
                        Scenario.InterlocutorType.PARENT, "Roditelj koji misli da kontroliše situaciju, emocionalno reaguje na kritiku"),

                // SAOBRAĆAJ
                scen(saobracaj, "Ubijedi prijatelja da ne vozi pijan", "Prijatelj smatra da može voziti nakon par pića. Ubijedi ga da je to opasno.",
                        Scenario.InterlocutorType.SKEPTICAL_FRIEND, "Prijatelj koji podcjenjuje opasnost i smatra se dobrim vozačem"),
                scen(saobracaj, "Objasni strancu zašto je pojas važan", "Na kampanji bezbjednosti trebaš uvjeriti prolaznika zašto treba koristiti sigurnosni pojas.",
                        Scenario.InterlocutorType.STRANGER, "Osoba koja rijetko koristi pojas i smatra to pretjerivanjem"),

                // ONLINE SIGURNOST
                scen(online, "Ubijedi roditelja da koristi jake lozinke", "Roditelj koristi istu lozinku svuda. Objasni mu opasnosti i uvjeri ga da promijeni navike.",
                        Scenario.InterlocutorType.PARENT, "Roditelj koji ne razumije tehnologiju i smatra da je bezbedan"),
                scen(online, "Debata o privatnosti na društvenim mrežama", "Kolega tvrdi da nema šta da krije online. Raspravite se o digitalnoj privatnosti.",
                        Scenario.InterlocutorType.DEBATER, "Iskusan korisnik interneta koji aktivno dijeli sadržaj i ne brine o privatnosti"),

                // KUĆNA BEZBJEDNOST
                scen(kucna, "Ubijedi ukućane da instaliraju alarm", "Ukućani smatraju da alarm nije potreban u mirnom kraju. Ubijedi ih u suprotno.",
                        Scenario.InterlocutorType.PARENT, "Roditelj koji smatra da je sused prevelik trošak za mir"),
                scen(kucna, "Objasni sused važnost zajedničke bezbjednosti", "Novi sused ne zanima ga bezbjednost u zgradi. Objasni mu zašto je važno sarađivati.",
                        Scenario.InterlocutorType.STRANGER, "Novi stanodavac koji se nije integrisao u zajednicu"),

                // RADNO MJESTO
                scen(radnoMjesto, "Predloži poboljšanje uslova rada šefu", "Radni uslovi su loši. Ubijedi šefa da investira u ergonomiju i bezbjednost radnog mjesta.",
                        Scenario.InterlocutorType.AUTHORITY, "Šef koji gleda troškove i ne vidi potrebu za promjenama"),
                scen(radnoMjesto, "Ubijedi kolegu da prijavi nesigurne uslove", "Kolega ne želi da prijavi problem jer se boji reakcije uprave. Motiviši ga.",
                        Scenario.InterlocutorType.SKEPTICAL_FRIEND, "Kolega koji se boji negativnih posljedica i sumnja da će se išta promijeniti"),

                // VRIJEDNOST UČENJA
                scen(vrijednostUcenja, "Ubijedi prijatelja da se vrati školovanju", "Prijatelj odustao od studija. Ubijedi ga da se vrati ili nađe alternativno obrazovanje.",
                        Scenario.InterlocutorType.SKEPTICAL_FRIEND, "Prijatelj koji smatra da iskustvo vrijedi više od diplome"),
                scen(vrijednostUcenja, "Objasni poslodavcu važnost edukacije zaposlenika", "Pokušaj uvjeriti poslodavca da investira u obuke i edukacije tima.",
                        Scenario.InterlocutorType.AUTHORITY, "Menadžer koji gleda troškove i kratkoročne rezultate"),

                // ONLINE VS KLASIČNO
                scen(onlineVsKlasicno, "Debata o online obrazovanju", "Tvrdite da je online učenje jednako vrijedno kao klasično. Protivnik se ne slaže.",
                        Scenario.InterlocutorType.DEBATER, "Profesor koji vjeruje isključivo u klasično obrazovanje"),
                scen(onlineVsKlasicno, "Ubijedi roditelja za online kurs", "Roditelj ne vjeruje u online kurseve. Ubijedi ga da upisuješ vrijedan program.",
                        Scenario.InterlocutorType.PARENT, "Zabrinut roditelj koji traži diplome i tradicionalne institucije"),

                // STRANI JEZICI
                scen(straniJezici, "Ubijedi kolegu da nauči engleski", "Kolega smatra da mu engleski nije potreban. Argumentuj zašto je danas neophodan.",
                        Scenario.InterlocutorType.SKEPTICAL_FRIEND, "Kolega koji misli da se može snać bez engleskog"),
                scen(straniJezici, "Objasni strancu benefite dvojezičnosti", "Na konferenciji trebaš objasniti osobi bez jezičnog iskustva zašto je učenje jezika korisno.",
                        Scenario.InterlocutorType.STRANGER, "Osoba koja nikad nije razmišljala o učenju stranog jezika"),

                // KONTINUIRANO USAVRŠAVANJE
                scen(kontinuiranoUsav, "Ubijedi menadžera za profesionalnu obuku", "Pregovaraj sa menadžerom da te podrži u pohađanju konferencija i kurseva.",
                        Scenario.InterlocutorType.AUTHORITY, "Menadžer koji smatra da imaš dovoljno vještina i gleda budžet"),
                scen(kontinuiranoUsav, "Motiviši prijatelja za samorazvoj", "Prijatelj se ne razvija profesionalno van posla. Ubijedi ga da uloži u sebe.",
                        Scenario.InterlocutorType.SKEPTICAL_FRIEND, "Prijatelj koji smatra da je posao posao i ostalo je slobodno vrijeme"),

                // ŽIVOTNE ODLUKE
                scen(zivotneOdluke, "Brani odluku o promjeni karijere pred roditeljima", "Odlučio si da napustiš siguran posao za startup. Ubijedi roditelje da podržu odluku.",
                        Scenario.InterlocutorType.PARENT, "Zabrinut roditelj koji vidi sigurnost ispred svega"),
                scen(zivotneOdluke, "Debata o selidbi u drugu zemlju", "Raspravljate se o prednostima odlaska u inostranstvo. Tvoj oponent se protivi.",
                        Scenario.InterlocutorType.DEBATER, "Iskusan debater koji brani ostanak u domovini patriotskim i praktičnim argumentima"),

                // VRIJEDNOSTI
                scen(vrijednosti, "Brani svoje etičke stavove na poslu", "Kolega/šef traži od tebe nešto što je etički upitno. Argumentuj zašto to ne možeš prihvatiti.",
                        Scenario.InterlocutorType.AUTHORITY, "Nadređeni koji smatra da je poslovni pragmatizam važniji od ideala"),
                scen(vrijednosti, "Debata o moralnim vrijednostima", "Raspravljate se o tome šta je važno u životu. Branite svoju životnu filozofiju.",
                        Scenario.InterlocutorType.DEBATER, "Iskusan debater sa suprotnom životnom filozofijom"),

                // ODNOSI
                scen(odnosi, "Ubijedi prijatelja da popravi odnos sa porodicom", "Prijatelj je u svađi s porodicom i odbija pomirenje. Pokušaj ga uvjeriti.",
                        Scenario.InterlocutorType.SKEPTICAL_FRIEND, "Tvrdoglav prijatelj koji smatra da je u pravu i ne želi prvi napraviti korak"),
                scen(odnosi, "Razgovor s roditeljima o izboru partnera", "Roditelji ne prihvataju tvog partnera. Uvjeri ih da podrže tvoju odluku.",
                        Scenario.InterlocutorType.PARENT, "Zabrinuti roditelji koji imaju drugačija očekivanja od partnera za dijete"),

                // KARIJERA
                scen(karijera, "Ubijedi šefa da te promovišu", "Smatrate da zaslužujete unapređenje. Argumentuj to svom šefu.",
                        Scenario.InterlocutorType.AUTHORITY, "Šef koji traži čvrste argumente i dokaze performansi"),
                scen(karijera, "Brani karijernu odluku pred roditeljima", "Roditelji žele da budeš doktor/pravnik. Ti si odlučio drugačije. Ubijedi ih.",
                        Scenario.InterlocutorType.PARENT, "Roditelji s jasnom vizijom šta je 'uspješna' karijera"),

                // PLATA
                scen(plata, "Pregovaraj o povišici", "Nisi dobio povišicu godinu dana. Zatraži je i argumentuj zašto je zaslužena.",
                        Scenario.InterlocutorType.AUTHORITY, "Menadžer koji brani budžet i traži konkretne razloge za povišicu"),
                scen(plata, "Pregovaraj o startnoj plati na novom poslu", "Na razgovoru za posao, pregovaraj o plati iznad prvog ponuđenog iznosa.",
                        Scenario.InterlocutorType.DEBATER, "Iskusan HR menadžer koji zna sve pregovaračke taktike"),

                // UGOVORI
                scen(ugovori, "Pregovaraj o uslovima zakupa stana", "Vlasnik stana nudi lošije uslove. Pregovaraj o cijeni i uslovima zakupa.",
                        Scenario.InterlocutorType.AUTHORITY, "Vlasnik koji ima jak pregovarački položaj i malo je fleksibilan"),
                scen(ugovori, "Ubijedi partnera da izmijeni uslove ugovora", "Poslovni partner inzistira na nepovoljnim uslovima. Predloži kompromis.",
                        Scenario.InterlocutorType.DEBATER, "Pametni poslovni čovjek koji brani svoju poziciju"),

                // PARTNERSTVA
                scen(partnerstva, "Ubijedi investitora u tvoj projekat", "Prezentiraš startup projekat investitoru koji je skeptičan. Uvjeri ga da uloži.",
                        Scenario.InterlocutorType.AUTHORITY, "Iskusan investitor koji je vidio mnogo projekata i traži dokaze rentabilnosti"),
                scen(partnerstva, "Predloži poslovnu saradnju stranci", "Trebaš uvjeriti straniku kompaniju da sarađuje sa tvojom firmom bez prethodnog odnosa.",
                        Scenario.InterlocutorType.STRANGER, "Predstavnik kompanije bez poznavanja tvog posla, oprezan i neutralan"),

                // PREGOVORI O CIJENI
                scen(pregovoriCijena, "Pregovaraj o cijeni auta", "Kupuješ automobil i trebaš dobiti bolju cijenu od prodavca.",
                        Scenario.InterlocutorType.DEBATER, "Iskusan prodavac koji zna sve trikove i drži visoku cijenu"),
                scen(pregovoriCijena, "Pregovaraj sa dobavljačem", "Dobavljač je povisio cijene. Pregovaraj da ostanete na starim uslovima.",
                        Scenario.InterlocutorType.AUTHORITY, "Dobavljač koji ima monopol na tržištu i ne mora mnogo pregovarati"),

                // EKOLOGIJA
                scen(ekologija, "Ubijedi prijatelja da reciklira", "Prijatelj smatra da recikliranje ne pravi razliku. Argumentuj zašto je važno.",
                        Scenario.InterlocutorType.SKEPTICAL_FRIEND, "Prijatelj koji misli da individualne akcije ne mijenjaju ništa"),
                scen(ekologija, "Objasni strancu klimatske promjene", "Na ulici susrećeš osobu koja ne vjeruje u klimatske promjene. Pokušaj je uvjeriti.",
                        Scenario.InterlocutorType.STRANGER, "Skeptik bez naučnog predznanja koji se oslanja na svakodnevna iskustva"),

                // TEHNOLOGIJA
                scen(tehnologija, "Debata o uticaju AI na poslove", "Tvrdiš da AI stvara više nego što ukida poslove. Oponent se protivi.",
                        Scenario.InterlocutorType.DEBATER, "Iskusan ekonomista koji brani suprotnu tezu sa statistikama"),
                scen(tehnologija, "Ubijedi roditelja da koristi smartphone", "Roditelj odbija modernu tehnologiju. Ubijedi ga da je koristan alat.",
                        Scenario.InterlocutorType.PARENT, "Roditelj koji se boji tehnologije i naviknut je na stare metode"),

                // POLITIKA
                scen(politika, "Debata o ekonomskoj politici", "Raspravljate se o politici koja utiče na svakodnevni život. Branite svoju poziciju.",
                        Scenario.InterlocutorType.DEBATER, "Iskusan politički analitičar sa suprotnim stavovima"),
                scen(politika, "Ubijedi neizlazača da izađe na glasanje", "Prijatelj smatra da glasanje ne mijenja ništa. Argumentuj zašto je važno.",
                        Scenario.InterlocutorType.SKEPTICAL_FRIEND, "Cinični prijatelj koji je izgubio vjeru u sistem"),

                // KULTURA
                scen(kultura, "Branite kulturnu raznolikost pred skeptikom", "Neko tvrdi da kulturne razlike dijele društvo. Argumentuj suprotno.",
                        Scenario.InterlocutorType.DEBATER, "Osoba s konzervativnim stavovima o kulturnoj uniformnosti"),
                scen(kultura, "Objasni strancu tradicije svog naroda", "Stranac ne razumije tvoje kulturne tradicije. Objasni ih i pokaži vrijednost.",
                        Scenario.InterlocutorType.STRANGER, "Radoznala osoba bez ikakvih predrasuda, ali i bez predznanja")
        );
        scenarioRepository.saveAll(scenarios);
    }

    private Scenario scen(Topic topic, String title, String description,
                           Scenario.InterlocutorType type, String profile) {
        return Scenario.builder()
                .topic(topic).title(title).description(description)
                .interlocutorType(type).interlocutorProfile(profile).build();
    }

    private void createLearningPlan(User user) {
        LearningPlan plan = LearningPlan.builder()
                .user(user)
                .type(LearningPlan.PlanType.WEEKLY)
                .tasks("[{\"title\":\"Vježba argumentacije\",\"time\":\"09:00\",\"duration\":\"15 min\",\"done\":false}," +
                       "{\"title\":\"Simulacija debate\",\"time\":\"14:00\",\"duration\":\"20 min\",\"done\":false}," +
                       "{\"title\":\"Analiza govora\",\"time\":\"19:00\",\"duration\":\"10 min\",\"done\":false}]")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(7))
                .build();
        learningPlanRepository.save(plan);
    }

    private void createNotifications(User user) {
        List<Notification> notifications = List.of(
                Notification.builder().user(user).type(Notification.NotificationType.SYSTEM)
                        .title("Dobrodošli u Persuasion Coach!")
                        .message("Počnite svoju prvu vježbu i razvijajte komunikacijske vještine.")
                        .build(),
                Notification.builder().user(user).type(Notification.NotificationType.CHALLENGE)
                        .title("Nova vježba dostupna")
                        .message("Probajte novu simulaciju 'Pregovaranje o plati'")
                        .build()
        );
        notificationRepository.saveAll(notifications);
    }

    private void awardInitialBadges(User user, List<Badge> badges) {
        badges.stream()
                .filter(b -> b.getName().equals("Prva vježba"))
                .findFirst()
                .ifPresent(badge -> {
                    UserBadge ub = UserBadge.builder().user(user).badge(badge).build();
                    userBadgeRepository.save(ub);
                });
    }
}
