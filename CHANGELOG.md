# Changelog

## [1.3.0] - 2026-04-14
### Added
- PWA Icons und Manifest (Homebildschirm-Installation)
- Pizza teilen mit mehreren Usern (sessionId, automatische Aufteilung)
- Lernende Dropdowns für Pizza-Sorte und Ort (global geteilt, jeder kann hinzufügen)
- Datum rückdatieren beim Eintragen
- Build-Nummer und Version im Profil
- /about Seite mit Changelog und Roadmap
- Safe Area Fix für iPhone Home-Indikator

## [1.2.0] - 2026-04-14
### Added
- Halbe Pizzen (½, 1, 1½, 2)
- Avatar-Picker mit Emoji-Mart
- Sterne-Bewertung (1–5) beim Eintragen
- Pizza-Sorte und Ort als Felder
- Statistik-Seite (Jahres- und Monatsübersicht, Top-Sorten, Top-Orte)
- Bottom Sheet auf Mobile (kein Keyboard-Bug mehr)
- Einträge löschen (eigene + Admin)
- Admin: Alle Einträge verwalten
### Fixed
- Mobile Navigation Safe Area
- iOS Keyboard überdeckt Eingabefelder nicht mehr

## [1.1.0] - 2026-04-14
### Added
- Mobile Navigation Redesign (4 Tabs + Hamburger Menü)
- Cloudflare Tunnel (pizza.maxds.me)
- Auto-Update Script mit ntfy Push-Notification
- Node Exporter für Prometheus Monitoring
### Fixed
- Redirect auf interne IP nach Login
- emoji-mart Peer-Dependency Konflikt mit React 19

## [1.0.0] - 2026-04-14
### Added
- Initiales Setup: Next.js 15, Prisma, Auth.js, SQLite
- Login und Benutzerverwaltung (Admin/User)
- +1 Pizza Button mit Konfetti-Animation
- Dashboard mit eigenem Count und Gesamtcount
- Leaderboard
- Achievements und Badges
- Profil-Seite
- Docker Compose Deployment
- Prisma Migrations
