# 🍕 Pizza Count

Eine persönliche Web-App zum Tracken aller gemeinsam gegessenen Pizzen.

## Features

- **Pizza-Log**: Jeden Pizza-Abend mit Datum, Sorte, Ort, Bewertung und Notiz eintragen
- **Pizza teilen**: Mehrere User teilen sich eine Pizza (automatische Aufteilung)
- **Rangliste & Abzeichen**: Wer hat mehr gegessen? + Meilenstein-Badges auf einer Seite
- **Statistik**: Monat/Jahr-Übersicht, Top Sorten, Top Orte
- **Animationen**: Pizzaregen beim Hinzufügen
- **Benutzerverwaltung**: Admin-Rolle und Standard-User
- **PWA**: Installierbar auf iOS und Android (Homebildschirm-Icon, Safe Area)
- **Responsive**: Optimiert für Handy, Tablet und PC

## Navigation

### Mobile Bottom Bar
| Position | Tab | Funktion |
|----------|-----|----------|
| 1 | 🍕 Zuhause | Dashboard mit eigenem Count + Feed |
| 2 | 🏆 Rangliste | Rangliste (Tab 1) + Abzeichen (Tab 2) |
| 3 | 🍕 Eintragen | Pizza-Eintrag Bottom Sheet (Center-Button) |
| 4 | 📊 Statistik | Statistik-Seite |
| 5 | ☰ Mehr | Drawer-Menü |

### Mehr-Drawer
- 👤 Profil
- ⚙️ Admin *(nur für Admins)*
- ℹ️ Über die App
- 🚪 Abmelden

### Desktop Sidebar
Zuhause · Rangliste · Statistik · Profil · Über die App · Admin *(nur für Admins)*

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Animationen**: Framer Motion
- **Datenbank**: SQLite via Prisma ORM
- **Auth**: Auth.js v5 (Credentials Provider)
- **Deployment**: Docker Compose

## Setup & Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Datenbank initialisieren
npx prisma migrate dev

# Icons generieren (einmalig)
npm run generate-icons

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
