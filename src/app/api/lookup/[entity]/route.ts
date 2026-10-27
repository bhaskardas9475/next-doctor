import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  const { entity } = await params;
  const q = request.nextUrl.searchParams.get("q") ?? "";

  if (entity === "patients") {
    return NextResponse.json(
      await prisma.patient.findMany({
        where: { OR: [{ name: { contains: q } }, { code: { contains: q } }] },
        select: { id: true, name: true, code: true },
        take: 20,
        orderBy: { name: "asc" },
      }),
    );
  }

  if (entity === "medicines") {
    return NextResponse.json(
      await prisma.medicine.findMany({
        where: { name: { contains: q } },
        select: { id: true, name: true, dosageFormStrength: true },
        take: 20,
        orderBy: { name: "asc" },
      }),
    );
  }

  if (entity === "tests") {
    return NextResponse.json(
      await prisma.test.findMany({
        where: { name: { contains: q } },
        select: { id: true, name: true },
        take: 20,
        orderBy: { name: "asc" },
      }),
    );
  }

  return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
}
