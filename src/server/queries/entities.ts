import { prisma } from "@/lib/db";

function range(page: number, pageSize: number) {
  const size = Math.min(Math.max(pageSize, 5), 50);
  return { take: size, skip: (Math.max(page, 1) - 1) * size };
}

export async function getMedicines(q: string, page: number, pageSize: number) {
  const where = q
    ? { OR: [{ name: { contains: q } }, { dosageFormStrength: { contains: q } }] }
    : {};
  const args = range(page, pageSize);
  return {
    rows: await prisma.medicine.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...args,
    }),
    total: await prisma.medicine.count({ where }),
  };
}

export async function getTests(q: string, page: number, pageSize: number) {
  const where = q
    ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] }
    : {};
  const args = range(page, pageSize);
  return {
    rows: await prisma.test.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...args,
    }),
    total: await prisma.test.count({ where }),
  };
}

export async function getPatients(q: string, page: number, pageSize: number) {
  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { code: { contains: q } },
          { phone: { contains: q } },
        ],
      }
    : {};
  const args = range(page, pageSize);
  return {
    rows: await prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...args,
    }),
    total: await prisma.patient.count({ where }),
  };
}

export async function getPatientById(id: number) {
  if (!Number.isInteger(id) || id < 1) return null;

  return prisma.patient.findUnique({ where: { id } });
}

export async function getPrescriptions(q: string, page: number, pageSize: number) {
  const where = q
    ? {
        OR: [
          { number: { contains: q } },
          { patient: { name: { contains: q } } },
          { patient: { code: { contains: q } } },
        ],
      }
    : {};
  const args = range(page, pageSize);
  return {
    rows: await prisma.prescription.findMany({
      where,
      include: {
        patient: true,
        medicines: { include: { medicine: true } },
        tests: { include: { test: true } },
        _count: { select: { medicines: true, tests: true } },
      },
      orderBy: { createdAt: "desc" },
      ...args,
    }),
    total: await prisma.prescription.count({ where }),
  };
}
