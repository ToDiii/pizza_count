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

### Optional: Continuous Backup (Litestream)

Die Compose-Datei enthält einen optionalen Litestream-Sidecar, der die SQLite-Datei
kontinuierlich nach S3 oder Backblaze B2 repliziert.

```bash
# LITESTREAM_* in .env befüllen, dann:
docker compose --profile backup up -d
```

Konfiguration siehe `litestream.yml` und `.env.example`.

## Umgebungsvariablen

Vollständige Liste siehe `.env.example`. Minimum für Self-Hosting:

```env
AUTH_SECRET=$(openssl rand -base64 32)
DATABASE_URL="file:/data/db/pizza.db"
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://deine-domain.tld
SETUP_ENABLED=true   # nach Erstlogin auf false setzen
```

## Erster Start / Admin anlegen

1. Container starten – `SETUP_ENABLED=true` lassen.
2. `/setup` im Browser öffnen und den ersten Admin-Account anlegen.
3. In `.env` `SETUP_ENABLED=false` setzen und Container neu starten – die Route ist dann dauerhaft deaktiviert.

## Sicherheit

Die App ist für Self-Hosting hinter einem Cloudflare Tunnel ausgelegt.
Eingebaute Schutzmechanismen:

- **Auth.js v5** mit JWT-Session
- **bcrypt** (Cost 12) für Passwörter
- **Brute-Force-Schutz**: Email- und IP-Lockout mit exponentiellem Delay
- **Zod-Validierung** aller Server-Actions
- **Setup-Guard**: `/setup` nur solange kein Admin existiert (plus Env-Flag)
- **CSRF** via Auth.js
- **Prisma** (keine Raw-SQL ⇒ keine SQL-Injection)

Empfehlungen zusätzlich:

- Cloudflare Rate-Limiting-Rule für `/api/auth/*` (5/min/IP)
- Regelmäßig Backups prüfen (Restore-Drill)
- Updates zeitnah einspielen
