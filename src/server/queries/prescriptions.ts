import { prisma } from "@/lib/db";

export async function getPrescription(id: number) {
  return prisma.prescription.findUnique({
    where: { id },
    include: {
      patient: true,
      medicines: { include: { medicine: true } },
      tests: { include: { test: true } },
    },
  });
}
