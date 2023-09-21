/*
  Warnings:

  - The primary key for the `answers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `deck_id` on the `answers` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `answers` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `decks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `decks` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `questions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `deck_id` on the `questions` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `questions` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_answers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT,
    "deck_id" INTEGER NOT NULL,
    CONSTRAINT "answers_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_answers" ("deck_id", "id", "text") SELECT "deck_id", "id", "text" FROM "answers";
DROP TABLE "answers";
ALTER TABLE "new_answers" RENAME TO "answers";
CREATE TABLE "new_decks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "description" TEXT,
    "language" TEXT,
    "icon" TEXT,
    "darknessLevel" INTEGER
);
INSERT INTO "new_decks" ("darknessLevel", "description", "icon", "id", "language", "title") SELECT "darknessLevel", "description", "icon", "id", "language", "title" FROM "decks";
DROP TABLE "decks";
ALTER TABLE "new_decks" RENAME TO "decks";
CREATE TABLE "new_questions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT,
    "spaces" INTEGER,
    "deck_id" INTEGER NOT NULL,
    CONSTRAINT "questions_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_questions" ("deck_id", "id", "spaces", "text") SELECT "deck_id", "id", "spaces", "text" FROM "questions";
DROP TABLE "questions";
ALTER TABLE "new_questions" RENAME TO "questions";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
