
# Persuasion Coach

Full-stack aplikacija za vježbanje vještina uvjeravanja uz pomoć AI-a.

**Stack:** Spring Boot (Java) · React (Vite) · PostgreSQL · Anthropic Claude API

---

## Setup

### 1. Environment varijable (backend)

Backend čita osjetljive podatke iz environment varijabli. Postavi ih na jedan od sljedećih načina:

**Opcija A — IntelliJ Run Configuration (preporučeno lokalno)**

1. Otvori Run → Edit Configurations → Spring Boot aplikacija
2. Klikni na polje "Environment variables"
3. Dodaj svaku varijablu iz tabele ispod

**Opcija B — Windows System Environment Variables**

1. Start → Traži "Edit the system environment variables" → Environment Variables
2. Pod "User variables" dodaj svaku varijablu iz tabele ispod

| Varijabla | Opis |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API ključ (Anthropic Console) |
| `GEMINI_API_KEY` | Gemini API ključ (nije aktivan, ali treba biti postavljen) |
| `DB_PASSWORD` | PostgreSQL lozinka (lokalno obično `postgres`) |
| `JWT_SECRET` | Tajni string za potpisivanje JWT tokena (min. 32 karaktera) |
| `MAIL_PASSWORD` | Gmail App Password za slanje emailova |

Vidi `backend/.env.example` za kompletan popis.

### 2. Frontend

```bash
npm install
npm run dev
```

### 3. Backend

```bash
cd backend
./mvnw spring-boot:run
```

---

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.
