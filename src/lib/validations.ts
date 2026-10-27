import { z } from "zod";

export const medicineSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  dosageFormStrength: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});
export const testSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional(),
});
export const patientSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  age: z.coerce.number().int().min(0).max(150),
  gender: z.string().min(1),
  phone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const medicineRow = z.object({
  medicineId: z.coerce.number().int().positive(),
  dosage: z.string().trim().min(1),
  frequency: z.string().trim().min(1),
  duration: z.string().trim().min(1),
  instructions: z.string().trim().optional(),
});
const testRow = z.object({
  testId: z.coerce.number().int().positive(),
  instructions: z.string().trim().optional(),
});
export const prescriptionSchema = z
  .object({
    patientId: z.coerce.number().int().positive(),
    diagnosisNotes: z.string().trim().optional(),
    medicines: z.array(medicineRow).default([]),
    tests: z.array(testRow).default([]),
  })
  .superRefine((value, ctx) => {
    if (value.medicines.length === 0 && value.tests.length === 0)
      ctx.addIssue({
        code: "custom",
        path: ["medicines"],
        message: "Add at least one medicine or test",
      });
    if (
      new Set(value.medicines.map((row) => row.medicineId)).size !==
      value.medicines.length
    )
      ctx.addIssue({
        code: "custom",
        path: ["medicines"],
        message: "A medicine cannot be repeated",
      });
    if (new Set(value.tests.map((row) => row.testId)).size !== value.tests.length)
      ctx.addIssue({
        code: "custom",
        path: ["tests"],
        message: "A test cannot be repeated",
      });
  });

export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
