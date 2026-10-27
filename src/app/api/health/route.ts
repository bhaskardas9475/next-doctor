import { prisma } from "@/lib/db";

export function GET() {
  try {
    // Touch the database so this endpoint confirms both the app and SQLite are ready.
    const patients = await prisma.patient.count();

    return Response.json({
      ready: true,
      status: "ok",
      patients,
    });
  } catch {
    return Response.json({ ready: false, status: "error" }, { status: 503 });
  }
}
