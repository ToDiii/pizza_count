-- Normalize existing emails to lowercase.
-- Die neue Login-Logik trimmt + lowercased Emails vor dem DB-Lookup.
-- Dieser Schritt ist idempotent und verändert nur Zeilen, die tatsächlich
-- aktuell Groß-/Kleinbuchstaben gemischt haben.
--
-- Falls durch die Kleinschreibung zwei Accounts kollidieren würden,
-- bricht das Statement mit UNIQUE-Violation ab – in dem Fall manuell
-- einen der beiden User löschen/umbenennen.

UPDATE "User" SET "email" = LOWER("email") WHERE "email" != LOWER("email");
