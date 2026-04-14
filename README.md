# 🍕 Pizza Count

Eine persönliche Web-App zum Tracken aller gemeinsam gegessenen Pizzen.

## Features

- **Pizza-Log**: Jeden Pizza-Abend mit Datum, Notiz und (optional) Bewertung eintragen
- **Achievements/Badges**: Meilenstein-Abzeichen für erreichte Pizza-Counts
- **Leaderboard**: Wer hat mehr gegessen?
- **Animationen**: Konfetti & Reaktionen beim Hinzufügen einer Pizza
- **Benutzerverwaltung**: Admin-Rolle und Standard-User
- **Responsive**: Funktioniert auf Handy, Tablet und PC

## Geplante Erweiterungen

- Bewertungssystem (Ort, Pizza-Sorte, Sterne-Bewertung)
- Google Maps Integration für Ort-Verlinkung

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Animationen**: Framer Motion
- **Datenbank**: SQLite via Prisma ORM
- **Auth**: Auth.js (Credentials Provider)
- **Deployment**: Docker Compose

## Setup & Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Datenbank initialisieren
npx prisma migrate dev

# Entwicklungsserver starten
npm run dev
```

## Deployment (Docker)

```bash
docker compose up -d
```

Die SQLite-Datei liegt in einem persistenten Volume unter `/data/db/pizza.db`.

## Umgebungsvariablen

Erstelle eine `.env`-Datei basierend auf `.env.example`:

```env
AUTH_SECRET=dein-geheimes-secret
DATABASE_URL="file:/data/db/pizza.db"
```

## Nutzer anlegen

Beim ersten Start kann über `/setup` ein Admin-Account angelegt werden (nur wenn noch kein Admin existiert).
