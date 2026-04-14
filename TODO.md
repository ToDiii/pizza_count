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
- ✅ Badge-System implementieren (wird automatisch vergeben)
- ✅ Meilenstein-Badges:
  - 🍕 „Erste Pizza" – 1. Eintrag
  - 🔟 „10er Club" – 10 Pizzen
  - 🥇 „50er Club" – 50 Pizzen
  - 💯 „Centurion" – 100 Pizzen
  - 🍕👑 „Pizza Royale" – 200 Pizzen
- ✅ Badge-Anzeige im Profil

### Mobile
- ✅ Mobile Viewport Zoom Fix
- ✅ Bottom Tab Bar (4 Tabs) + Hamburger Drawer

---

## Phase 2 – Bewertungssystem ⭐

- ✅ Datenbankschema erweitern: `PizzaEntry` um Felder `location`, `pizzaType`, `rating`, `amount`
- ✅ Eintrag-Formular (Bottom Sheet):
  - ✅ Mengenwahl (½, 1, 1½, 2)
  - ✅ Sterne-Bewertung (1–5)
  - ✅ Pizza-Sorte mit Autocomplete
  - ✅ Ort / Restaurant mit Autocomplete
  - ✅ Notiz
- ✅ Statistik-Seite: Pizzen pro Monat/Jahr + Top Sorten + Top Orte
- ✅ Avatar-Picker (Emoji) im Profil
- ✅ Admin: Alle Einträge anzeigen und löschen

### Dropdown-Felder beim Pizza-Eintragen (✅ Umgesetzt)
- Pizza-Sorte: Autocomplete aus vergangenen Einträgen
- Ort/Restaurant: Autocomplete aus vergangenen Einträgen
- Bewertung: Sterne-Auswahl (1-5)
- Menge: Segmented Control (½, 1, 1½, 2)

- [ ] Historien-Ansicht: alle Einträge mit Details, filterbar nach User
- [ ] „Beste Pizza" Statistik: höchstbewerteter Eintrag
- [ ] Google Maps Link: Vorschau / klickbares Icon

---

## Phase 3 – Polish & Extras ✨

- ✅ PWA-Support (Manifest, Icons, apple-touch-icon, safe area)
- ✅ Smart Dropdowns: globale Pizza-Sorten & Orte mit Verwaltung im Admin
- ✅ Pizza-Sharing: mehrere User teilen sich eine Pizza (sessionId, split amount)
- ✅ Backdating: Datum beim Eintragen wählbar
- ✅ Build-Version im Profil + /about Seite
- [ ] Dark Mode
- [ ] Push Notifications: „Zeit für Pizza?" (optional)
- [ ] Export: eigene Einträge als CSV
- [ ] Admins können beliebige Einträge bearbeiten (nicht nur löschen)

### Admin-Badges erstellen (⬜ Geplant)
Admins können manuelle Badges/Abzeichen erstellen und an User vergeben:
- Badge hat: Emoji, Name, Beschreibung
- Zwei Typen: automatisch (Meilenstein) und manuell (Admin-vergabe)
- UI in /admin Panel
- Schema: Badge-Tabelle mit Typ, manueller Vergabe-Relation

### Merge/Edit PizzaTypeOptions und LocationOptions (⬜ Geplant)
- Admins können zwei Einträge zusammenführen (z.B. "Salami" + "salami" → "Salami")

---

## Deployment-Checkliste 🐳

- [ ] LXC auf Proxmox erstellen (Debian, 512 MB RAM, 8 GB Disk)
- [ ] Docker + Docker Compose im LXC installieren
- [ ] Volume für SQLite anlegen: `/data/pizza_count/db/`
- [ ] `.env` befüllen (AUTH_SECRET generieren)
- [ ] Cloudflare Tunnel einrichten → `pizza.maxds.me`
- [ ] Synology Backup-Job für SQLite-Datei einrichten

---

## Bekannte Einschränkungen / Entscheidungen

- **Kein Pizza-Streak**: wurde bewusst weggelassen (Pizza ist kein tägliches Ritual)
- **SQLite statt PostgreSQL**: ausreichend für 2 User, kein extra Datenbankserver nötig
- **Halbe Pizzen**: werden als 0.5 gespeichert, formatiert als „½"
