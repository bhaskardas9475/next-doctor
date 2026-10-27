"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  medicineSchema,
  patientSchema,
  prescriptionSchema,
  testSchema,
} from "@/lib/validations";

function optional(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || undefined;
}

function prescriptionValidationMessage(issues: { path: (string | number)[]; message: string }[]) {
  const issue = issues[0];
  const field = String(issue?.path[0] ?? "");

  if (field === "patientId") return "Please select a patient from the dropdown.";
  if (field === "medicines") {
    if (issue.message.includes("at least")) return "Add at least one medicine or test.";
    return "Check the medicine details and make sure no medicine is repeated.";
  }
  if (field === "tests") {
    return "Check the test details and make sure no test is repeated.";
  }
  return "Please complete the prescription.";
}

export async function createMedicineAction(formData: FormData) {
  const parsed = medicineSchema.safeParse({
    name: formData.get("name"),
    dosageFormStrength: optional(formData.get("dosageFormStrength")),
    notes: optional(formData.get("notes")),
  });
  if (!parsed.success) {
    redirect(`/medicines?error=${encodeURIComponent("Please enter a medicine name.")}`);
  }

  try {
    await prisma.medicine.create({ data: parsed.data });
  } catch {
    redirect(
      `/medicines?error=${encodeURIComponent("Unable to add medicine. It may already exist.")}`,
    );
  }
  redirect(`/medicines?created=${encodeURIComponent(parsed.data.name)}`);
}

export async function deleteMedicineAction(id: number) {
  const usage = await prisma.prescriptionMedicine.count({ where: { medicineId: id } });
  if (usage > 0) {
    return { ok: false, message: "This medicine is used in a prescription." };
  }

  try {
    await prisma.medicine.delete({ where: { id } });
    revalidatePath("/medicines");
    return { ok: true };
  } catch {
    return { ok: false, message: "Unable to delete this medicine." };
  }
}

export async function createTestAction(formData: FormData) {
  const parsed = testSchema.safeParse({
    name: formData.get("name"),
    description: optional(formData.get("description")),
  });
  if (!parsed.success) {
    redirect(`/tests?error=${encodeURIComponent("Please enter a test name.")}`);
  }

  try {
    await prisma.test.create({ data: parsed.data });
  } catch {
    redirect(`/tests?error=${encodeURIComponent("Unable to add test. It may already exist.")}`);
  }
  redirect(`/tests?created=${encodeURIComponent(parsed.data.name)}`);
}

export async function deleteTestAction(id: number) {
  const usage = await prisma.prescriptionTest.count({ where: { testId: id } });
  if (usage > 0) {
    return { ok: false, message: "This test is used in a prescription." };
  }

  try {
    await prisma.test.delete({ where: { id } });
    revalidatePath("/tests");
    return { ok: true };
  } catch {
    return { ok: false, message: "Unable to delete this test." };
  }
}

export async function createPatientAction(formData: FormData) {
  const parsed = patientSchema.safeParse({
    name: formData.get("name"),
    age: formData.get("age"),
    gender: formData.get("gender"),
    phone: optional(formData.get("phone")),
    notes: optional(formData.get("notes")),
  });
  if (!parsed.success) {
    redirect(`/patients?error=${encodeURIComponent("Please complete all required patient fields.")}`);
  }
  let patient: { code: string };
  try {
    patient = await prisma.$transaction(async (tx) => {
      const counter = await tx.counter.upsert({
        where: { key: "patient" },
        create: { key: "patient", value: 1 },
        update: { value: { increment: 1 } },
      });
      return tx.patient.create({
        data: { ...parsed.data, code: `PT-${String(counter.value).padStart(4, "0")}` },
      });
    });
  } catch {
    redirect(`/patients?error=${encodeURIComponent("Unable to add patient.")}`);
  }
  redirect(`/patients?created=${encodeURIComponent(patient.code)}`);
}

export async function deletePatientAction(id: number) {
  const usage = await prisma.prescription.count({ where: { patientId: id } });
  if (usage > 0) {
    return { ok: false, message: "This patient has prescriptions and cannot be deleted." };
  }

  try {
    await prisma.patient.delete({ where: { id } });
    revalidatePath("/patients");
    return { ok: true };
  } catch {
    return { ok: false, message: "Unable to delete this patient." };
  }
}

function jsonField(formData: FormData, key: string) {
  try {
    return JSON.parse(String(formData.get(key) ?? "[]")) as unknown;
  } catch {
    return [];
  }
}

export async function createPrescriptionAction(formData: FormData) {
  const parsed = prescriptionSchema.safeParse({
    patientId: formData.get("patientId"),
    diagnosisNotes: optional(formData.get("diagnosisNotes")),
    medicines: jsonField(formData, "medicines"),
    tests: jsonField(formData, "tests"),
  });
  if (!parsed.success) {
    redirect(
      `/prescriptions?error=${encodeURIComponent(
        prescriptionValidationMessage(parsed.error.issues),
      )}`,
    );
  }

  let prescription: { number: string };
  try {
    prescription = await prisma.$transaction(async (tx) => {
      const counter = await tx.counter.upsert({
        where: { key: "prescription" },
        create: { key: "prescription", value: 1 },
        update: { value: { increment: 1 } },
      });
      return tx.prescription.create({
        data: {
          number: `RX-${String(counter.value).padStart(4, "0")}`,
          patientId: parsed.data.patientId,
          diagnosisNotes: parsed.data.diagnosisNotes,
          medicines: { create: parsed.data.medicines },
          tests: { create: parsed.data.tests },
        },
      });
    });
  } catch {
    redirect(
      `/prescriptions?error=${encodeURIComponent(
        "Unable to create prescription. Check the selected patient, medicines, and tests.",
      )}`,
    );
  }
  redirect(`/prescriptions?created=${encodeURIComponent(prescription.number)}`);
}

export async function deletePrescriptionAction(id: number) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.prescriptionMedicine.deleteMany({ where: { prescriptionId: id } });
      await tx.prescriptionTest.deleteMany({ where: { prescriptionId: id } });
      await tx.prescription.delete({ where: { id } });
    });
    revalidatePath("/prescriptions");
    return { ok: true };
  } catch {
    return { ok: false, message: "Unable to delete this prescription." };
  }
}
