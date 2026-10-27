import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await Promise.all([
    prisma.medicine.upsert({
      where: { name: "Paracetamol" },
      update: {},
      create: {
        name: "Paracetamol",
        dosageFormStrength: "Tablet 500mg",
        notes: "For pain and fever",
      },
    }),
    prisma.medicine.upsert({
      where: { name: "Amoxicillin" },
      update: {},
      create: { name: "Amoxicillin", dosageFormStrength: "Capsule 500mg" },
    }),
    prisma.medicine.upsert({
      where: { name: "Cetirizine" },
      update: {},
      create: { name: "Cetirizine", dosageFormStrength: "Tablet 10mg" },
    }),
  ]);
  await Promise.all([
    prisma.test.upsert({
      where: { name: "Complete blood count" },
      update: {},
      create: { name: "Complete blood count", description: "CBC" },
    }),
    prisma.test.upsert({
      where: { name: "Blood pressure" },
      update: {},
      create: { name: "Blood pressure", description: "Routine monitoring" },
    }),
  ]);
  const patient = await prisma.patient.upsert({
    where: { code: "PT-0001" },
    update: {},
    create: {
      code: "PT-0001",
      name: "Aarav Sharma",
      age: 34,
      gender: "Male",
      phone: "555-0101",
    },
  });
  await prisma.counter.upsert({
    where: { key: "patient" },
    update: { value: 1 },
    create: { key: "patient", value: 1 },
  });
  await prisma.counter.upsert({
    where: { key: "prescription" },
    update: { value: 1 },
    create: { key: "prescription", value: 1 },
  });
  await prisma.prescription.upsert({
    where: { number: "RX-0001" },
    update: {},
    create: {
      number: "RX-0001",
      patientId: patient.id,
      diagnosisNotes: "Seasonal symptoms",
      medicines: {
        create: {
          medicineId: (
            await prisma.medicine.findUniqueOrThrow({
              where: { name: "Paracetamol" },
            })
          ).id,
          dosage: "1 tablet",
          frequency: "Twice daily",
          duration: "5 days",
        },
      },
      tests: {
        create: {
          testId: (
            await prisma.test.findUniqueOrThrow({
              where: { name: "Complete blood count" },
            })
          ).id,
        },
      },
    },
  });

  await seedMedicines();
  await seedTests();
  await seedPatients();
  await seedPrescriptions();
}

async function seedMedicines() {
  let index = 1;
  while ((await prisma.medicine.count()) < 50) {
    await prisma.medicine.upsert({
      where: { name: `Sample Medicine ${String(index).padStart(2, "0")}` },
      update: {},
      create: {
        name: `Sample Medicine ${String(index).padStart(2, "0")}`,
        dosageFormStrength: index % 2 === 0 ? "Tablet 500mg" : "Capsule 250mg",
        notes: "Seeded sample medicine",
      },
    });
    index += 1;
  }
}

async function seedTests() {
  let index = 1;
  while ((await prisma.test.count()) < 50) {
    await prisma.test.upsert({
      where: { name: `Sample Test ${String(index).padStart(2, "0")}` },
      update: {},
      create: {
        name: `Sample Test ${String(index).padStart(2, "0")}`,
        description: "Seeded sample diagnostic test",
      },
    });
    index += 1;
  }
}

async function seedPatients() {
  let index = 1;
  while ((await prisma.patient.count()) < 50) {
    const code = `PT-${String(index).padStart(4, "0")}`;
    await prisma.patient.upsert({
      where: { code },
      update: {},
      create: {
        code,
        name: `Sample Patient ${String(index).padStart(2, "0")}`,
        age: 20 + (index % 55),
        gender: ["Female", "Male", "Other"][index % 3],
        phone: `555-${String(1000 + index).slice(-4)}`,
        notes: "Seeded sample patient",
      },
    });
    index += 1;
  }

  await prisma.counter.update({
    where: { key: "patient" },
    data: { value: await prisma.patient.count() },
  });
}

async function seedPrescriptions() {
  const patients = await prisma.patient.findMany({ orderBy: { code: "asc" } });
  const medicines = await prisma.medicine.findMany({ orderBy: { id: "asc" } });
  const tests = await prisma.test.findMany({ orderBy: { id: "asc" } });
  let index = 1;
  while ((await prisma.prescription.count()) < 50) {
    const number = `RX-${String(index).padStart(4, "0")}`;
    const patient = patients[(index - 1) % patients.length];
    const medicine = medicines[0];
    const test = tests[0];

    await prisma.prescription.upsert({
      where: { number },
      update: {},
      create: {
        number,
        patientId: patient.id,
        diagnosisNotes: "Seeded sample prescription",
        medicines: {
          create: {
            medicineId: medicine.id,
            dosage: "1 tablet",
            frequency: "Once daily",
            duration: "5 days",
          },
        },
        tests: {
          create: {
            testId: test.id,
            instructions: "Complete as directed",
          },
        },
      },
    });
    index += 1;
  }

  await prisma.counter.update({
    where: { key: "prescription" },
    data: { value: await prisma.prescription.count() },
  });
}

main().finally(() => prisma.$disconnect());
