/*
  Warnings:

  - The primary key for the `Car` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `brand` to the `Car` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Car" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Car_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Car" ("id", "model", "ownerId") SELECT "id", "model", "ownerId" FROM "Car";
DROP TABLE "Car";
ALTER TABLE "new_Car" RENAME TO "Car";
CREATE UNIQUE INDEX "Car_id_key" ON "Car"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
