# 📋 Pizza Count – TODO

## Phase 1 – MVP (Initial Scaffold) 🚀

### Setup & Infrastruktur
- [ ] Next.js 15 Projekt initialisieren (App Router, TypeScript, Tailwind)
- [ ] Prisma + SQLite einrichten
- [ ] Auth.js mit Credentials Provider einrichten
- [ ] Datenbankschema: User, PizzaEntry
- [ ] `/setup`-Route für initialen Admin-Account (nur wenn kein Admin existiert)
- [ ] Docker Compose + Dockerfile erstellen
- [ ] `.env.example` erstellen

### Auth & Benutzerverwaltung
- [ ] Login-Seite (schön gestaltet, Pizza-Thema)
- [ ] Session-Management
- [ ] Admin-Panel: User anlegen, Passwort zurücksetzen, User löschen
- [ ] Rollen: `ADMIN`, `USER`
- [ ] Eigenes Profil bearbeiten (Anzeigename, Passwort ändern)

### Kern-Funktion: Pizza eintragen
- [ ] Großer, zentraler „+1 Pizza 🍕" Button
- [ ] Beim Klick: Notiz-Feld (optional) – „Welche Pizza war es?"
- [ ] Datum wird automatisch gesetzt (heute), manuell änderbar
- [ ] Konfetti- oder Pizzaregen-Animation beim Eintragen
- [ ] Bestätigungs-Feedback (Toast/Snackbar)

### Dashboard / Übersicht
- [ ] Gesamt-Pizza-Count (alle User zusammen)
- [ ] Eigener Count prominent angezeigt
- [ ] Letzte Pizza: „Vor X Tagen"
- [ ] Letzte 5 Einträge als Timeline/Feed

### Leaderboard
- [ ] Rangliste aller User nach Gesamtanzahl
- [ ] Anzeige: Platz, Name, Count, letzter Eintrag

### Achievements / Badges
- [ ] Badge-System implementieren (wird automatisch vergeben)
- [ ] Meilenstein-Badges:
  - 🍕 „Erste Pizza" – 1. Eintrag
  - 🔟 „10er Club" – 10 Pizzen
  - 🥇 „50er Club" – 50 Pizzen
  - 💯 „Centurion" – 100 Pizzen
  - 🍕👑 „Pizza Royale" – 200 Pizzen
- [ ] Badge-Anzeige im Profil
- [ ] Notification beim Freischalten eines neuen Badges

---

## Phase 2 – Bewertungssystem ⭐

- [ ] Datenbankschema erweitern: `PizzaEntry` um Felder `location`, `pizzaType`, `rating` (1–5 Sterne)
- [ ] Eintrag-Formular erweitern:
  - Ort-Feld (Freitext + optionaler Google Maps Link)
  - Pizza-Sorte (Freitext)
  - Sterne-Bewertung (1–5, interaktiv)
- [ ] Historien-Ansicht: alle Einträge mit Details, filterbar nach User
- [ ] „Beste Pizza" Statistik: höchstbewerteter Eintrag
- [ ] Google Maps Link: Vorschau / klickbares Icon

### Dropdown-Felder beim Pizza-Eintragen (⬜ Geplant)
Beim Erstellen eines neuen Eintrags sollen Dropdown-Felder verfügbar sein:
- Pizza-Sorte: Auswahl aus gespeicherten Sorten + Freitext-Option "Neue Sorte..."
- Ort/Restaurant: Auswahl aus gespeicherten Orten + Freitext-Option "Neuer Ort..."
- Bewertung: Sterne-Auswahl (1-5)
- Gespeicherte Werte werden aus der Datenbank geladen (vergangene Einträge)
- Schema-Erweiterung erforderlich: `pizzaType`, `location`, `rating` Felder in PizzaEntry

---

## Phase 3 – Polish & Extras ✨

- [ ] Dark Mode
- [ ] PWA-Support (App auf Homescreen installierbar)
- [ ] Push Notifications: „Zeit für Pizza?" (optional)
- [ ] Statistik-Seite: Pizzen pro Monat als Chart
- [ ] Export: eigene Einträge als CSV
- [ ] Admins können beliebige Einträge bearbeiten/löschen

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
