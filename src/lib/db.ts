import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

export type Patient = {
  id: number;
  name: string;
  diagnosis: string;
  status: "Stable" | "Needs review";
};

const dataDirectory = join(process.cwd(), "data");
mkdirSync(dataDirectory, { recursive: true });

const globalForDatabase = globalThis as typeof globalThis & {
  sqliteDatabase?: Database.Database;
};

const database =
  globalForDatabase.sqliteDatabase ??
  new Database(join(dataDirectory, "next-doctor.db"));

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.sqliteDatabase = database;
}

database.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Stable', 'Needs review'))
  );
`);

const patientCount = database
  .prepare("SELECT COUNT(*) AS count FROM patients")
  .get() as { count: number };

if (patientCount.count === 0) {
  const addPatient = database.prepare(
    "INSERT INTO patients (name, diagnosis, status) VALUES (?, ?, ?)",
  );

  const seedPatients = database.transaction(() => {
    addPatient.run("Aarav Sharma", "Routine follow-up", "Stable");
    addPatient.run("Maya Patel", "Blood pressure monitoring", "Needs review");
    addPatient.run("Noah Wilson", "Annual check-up", "Stable");
  });

  seedPatients();
}

export function getPatients(): Patient[] {
  return database
    .prepare(
      "SELECT id, name, diagnosis, status FROM patients ORDER BY id DESC",
    )
    .all() as Patient[];
}
