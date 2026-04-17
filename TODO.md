# 📋 Pizza Count – TODO

## Phase 1 – MVP (Initial Scaffold) 🚀

### Setup & Infrastruktur
- ✅ Next.js 15 Projekt initialisieren (App Router, TypeScript, Tailwind)
- ✅ Prisma + SQLite einrichten
- ✅ Auth.js mit Credentials Provider einrichten
- ✅ Datenbankschema: User, PizzaEntry
- ✅ `/setup`-Route für initialen Admin-Account (nur wenn kein Admin existiert)
- ✅ Docker Compose + Dockerfile erstellen
- ✅ `.env.example` erstellen

### Auth & Benutzerverwaltung
- ✅ Login-Seite (schön gestaltet, Pizza-Thema)
- ✅ Session-Management
- ✅ Admin-Panel: User anlegen, Passwort zurücksetzen, User löschen
- ✅ Rollen: `ADMIN`, `USER`
- ✅ Eigenes Profil bearbeiten (Anzeigename, Passwort ändern)

### Kern-Funktion: Pizza eintragen
- ✅ Großer, zentraler „+1 Pizza 🍕" Button
- ✅ Beim Klick: Bottom Sheet mit Menge, Sorte, Ort, Bewertung, Notiz
- ✅ Datum wird automatisch gesetzt (heute)
- ✅ Konfetti- oder Pizzaregen-Animation beim Eintragen
- ✅ Bestätigungs-Feedback (Toast/Snackbar)

### Dashboard / Übersicht
- ✅ Gesamt-Pizza-Count (alle User zusammen)
- ✅ Eigener Count prominent angezeigt
- ✅ Letzte Pizza: „Vor X Tagen"
- ✅ Letzte 5 Einträge als Timeline/Feed mit Löschen-Funktion

### Leaderboard
- ✅ Rangliste aller User nach Gesamtanzahl
- ✅ Anzeige: Platz, Avatar, Name, Count, letzter Eintrag

### Achievements / Badges
- ✅ Badge-System (automatische Vergabe)
- ✅ Meilenstein-Badges: Erste Pizza · 10er Club · 50er Club · Centurion · Pizza Royale
- ✅ Badge-Anzeige im Profil

### Mobile
- ✅ Mobile Viewport Zoom Fix
- ✅ Bottom Tab Bar + Hamburger Drawer
- ✅ Navigation Restructure
- ✅ Scrollbars ausgeblendet
- ✅ Zoom-Methoden blockiert
- ✅ Center Button Label Alignment
- ✅ Rangliste + Abzeichen Tab-Switcher

---

## Phase 2 – Bewertungssystem ⭐ (abgeschlossen)

- ✅ Schema-Erweiterung: location, pizzaType, rating, amount
- ✅ Eintrag-Formular (Bottom Sheet) mit Mengenwahl, Sterne, Autocomplete, Notiz
- ✅ Statistik-Seite
- ✅ Avatar-Picker (Emoji)
- ✅ Admin: Alle Einträge verwalten

- [ ] Historien-Ansicht: alle Einträge mit Details, filterbar nach User
- [ ] „Beste Pizza" Statistik: höchstbewerteter Eintrag
- [ ] Google Maps Link: Vorschau / klickbares Icon

---

## Phase 3 – Polish & Extras ✨ (abgeschlossen)

- ✅ PWA-Support (Manifest, Icons, safe area)
- ✅ Smart Dropdowns: globale Pizza-Sorten & Orte
- ✅ Pizza-Sharing (sessionId, split amount)
- ✅ Backdating
- ✅ Build-Version im Profil + /about
- ✅ Drawer/Profil Polish

---

## Phase 4 – Security Hardening 🔒 (laufend)

### ✅ Umgesetzt (v1.4.0)
- ✅ Zod-Validierung aller Server-Actions (Amount, Rating, Date, Name, Passwort, Avatar, IDs)
- ✅ Passwort-Mindestlänge 12 Zeichen
- ✅ `/setup`-Härtung: `SETUP_ENABLED`-Flag + Admin-Exists-Check + Transaction gegen Race
- ✅ selectedUserIds serverseitig gegen DB validiert
- ✅ Brute-Force-Schutz: DB-basierte Login-Attempts, Email- + IP-Lockout, exponentielles Delay, Timing-Attack-resistent (Dummy-bcrypt bei unbekannter Email)
- ✅ Litestream-Sidecar (optional, per `--profile backup`)
- ✅ Prisma-Indices auf PizzaEntry(userId, date, sessionId)
- ✅ Dockerfile: `--chown` konsistent, HEALTHCHECK im Image
- ✅ docker-compose: mem_limit, cpus, log-rotation
- ✅ Health-Endpoint prüft DB-Konnektivität
- ✅ Avatar-Whitelist (Zeichen-Filter)

### 🔴 Hoch – Vor Public-Exposure
- [ ] **CSP-Header + HSTS** in `next.config.ts` `headers()` einbauen
- [ ] **Cookie-Hardening** explizit in `auth.ts`: `sameSite: "lax"`, `secure: true`, `httpOnly: true` statt NextAuth-Defaults
- [ ] **NEXTAUTH_URL** im Betrieb auf echte Tunnel-Domain setzen + dokumentieren
- [ ] **Login-Route** zusätzlich per Cloudflare Rate-Limiting-Rule schützen (5/min/IP)
- [ ] **Audit-Log-Modell** für Admin-Aktionen + Login-Events (neue Prisma-Tabelle `AuditLog`)

### 🟠 Mittel
- [ ] **Foreign Keys** für `PizzaTypeOption.createdBy` / `LocationOption.createdBy` (SetNull bei User-Delete)
- [ ] **amount als Int** (in Zehnteln) statt Float – eliminiert Floating-Point-Summen-Fehler
- [ ] **Email-Normalisierung** beim User-Create + Migration existierender User auf lowercase
- [ ] **Dockerfile Alpine pinnen** (`node:20-alpine3.19`) für reproduzierbare Builds
- [ ] **Passwort-Zxcvbn-Check** im Frontend (Stärke-Indikator)
- [ ] **Account-Freigabe durch Admin** nach X Fehlversuchen (manuelles Unlock)
- [ ] **2FA (TOTP)** optional pro User
- [ ] **Content-Length / Body-Size-Limit** für Server-Actions konfigurieren

### 🟡 Niedrig / Ops
- [ ] **Backup-Test** dokumentieren (Litestream restore drill)
- [ ] **Update-Alerting** über ntfy bei verfügbaren Releases
- [ ] **Prometheus-Metriken** endpoint `/api/metrics` (requests, login_fails, db_size)
- [ ] **Structured Logging** (pino) statt `console.log`
- [ ] **CI-Pipeline**: typecheck + lint + build bei jedem PR

---

## Phase 5 – Features (geplant)

### Statistik-Filter
- [ ] Filter oben auf /stats: „Nur ich" / „Alle" / individuelle User (Mehrfachauswahl)
- [ ] Alle Charts reagieren auf Filter
- [ ] Admins sehen alle User, Standard-User nur sich + „Gemeinsam"
- [ ] Vergleichs-Chart: Balken nebeneinander pro Monat, je Farbe pro User
- [ ] Filterauswahl in URL: `?users=max,lisa`

### Admin-Badges
- [ ] Admins können manuelle Badges erstellen (Emoji, Name, Beschreibung)
- [ ] Zwei Typen: automatisch (Meilenstein) und manuell (Admin-Vergabe)
- [ ] UI im Admin-Panel
- [ ] Schema: Badge-Tabelle mit Typ + Vergabe-Relation

### Merge/Edit Optionen
- [ ] Admins können Sorte/Ort-Einträge zusammenführen („salami" + „Salami" → „Salami")
- [ ] Alle bestehenden Einträge werden umgeschrieben

### QoL
- [ ] Dark Mode
- [ ] PWA Push Notifications („Zeit für Pizza?")
- [ ] CSV/JSON-Export eigener Einträge
- [ ] Admins können beliebige Einträge bearbeiten (nicht nur löschen)
- [ ] QR-Code für Shared-Session (Mitesser scannt und bestätigt)
- [ ] Streak-Light: „3 Pizzen diese Woche"-Badge

---

## Deployment-Checkliste 🐳

- [ ] LXC auf Proxmox erstellen (Debian, 512 MB RAM, 8 GB Disk)
- [ ] Docker + Docker Compose im LXC installieren
- [ ] Volume für SQLite anlegen: `/data/pizza_count/db/`
- [ ] `.env` befüllen (`AUTH_SECRET` generieren, `NEXTAUTH_URL` setzen)
- [ ] Cloudflare Tunnel einrichten → `pizza.maxds.me`
- [ ] Nach Admin-Erstellung `SETUP_ENABLED=false` setzen + Container neu starten
- [ ] Litestream-Profile aktivieren: `docker compose --profile backup up -d`
- [ ] Cloudflare Rate-Limiting-Rule für `/api/auth/*` einrichten
- [ ] Restore-Drill durchspielen (einmalig, bevor man sich drauf verlässt)

---

## Bekannte Einschränkungen / Entscheidungen

- **Kein Pizza-Streak**: bewusst weggelassen (Pizza ist kein tägliches Ritual)
- **SQLite statt PostgreSQL**: ausreichend für <20 User, kein extra DB-Server
- **Halbe Pizzen**: werden als 0.5 gespeichert, formatiert als „½"
- **Kein Zero-Trust-Frontend**: eigener Login mit Brute-Force-Schutz + Lockout, Cloudflare Access bleibt optional
