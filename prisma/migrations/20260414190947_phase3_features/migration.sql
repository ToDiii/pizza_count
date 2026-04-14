-- CreateTable
CREATE TABLE "PizzaTypeOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "LocationOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PizzaEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" REAL NOT NULL DEFAULT 1.0,
    "note" TEXT,
    "pizzaType" TEXT,
    "location" TEXT,
    "rating" INTEGER,
    "sessionId" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "PizzaEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PizzaEntry" ("amount", "createdAt", "id", "location", "note", "pizzaType", "rating", "userId") SELECT "amount", "createdAt", "id", "location", "note", "pizzaType", "rating", "userId" FROM "PizzaEntry";
DROP TABLE "PizzaEntry";
ALTER TABLE "new_PizzaEntry" RENAME TO "PizzaEntry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PizzaTypeOption_name_key" ON "PizzaTypeOption"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LocationOption_name_key" ON "LocationOption"("name");
