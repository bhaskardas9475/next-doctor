import { getPatients } from "@/lib/db";

export function GET() {
  try {
    // Touch the database so this endpoint confirms both the app and SQLite are ready.
    const patients = getPatients();

    return Response.json({
      ready: true,
      status: "ok",
      patients: patients.length,
    });
  } catch {
    return Response.json(
      { ready: false, status: "error" },
      { status: 503 },
    );
  }
}
