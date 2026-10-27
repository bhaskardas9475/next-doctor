"use client";

import { useEffect, useState, useTransition } from "react";
import { AutoComplete } from "antd";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createPrescriptionAction } from "@/server/actions/entities";

type Option = {
  id: number;
  name: string;
  code?: string;
};

type FormValues = {
  patientId: string;
  diagnosisNotes: string;
  medicines: Array<{
    medicineId: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  tests: Array<{
    testId: string;
    instructions: string;
  }>;
};

function Lookup({
  entity,
  value,
  onChange,
  exclude = [],
  initialOption,
}: {
  entity: string;
  value: string;
  onChange: (id: string) => void;
  exclude?: string[];
  initialOption?: Option;
}) {
  const [text, setText] = useState("");
  const [options, setOptions] = useState<Option[]>(initialOption ? [initialOption] : []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`/api/lookup/${entity}?q=${encodeURIComponent(text)}`)
        .then((response) => response.json() as Promise<Option[]>)
        .then((nextOptions) => {
          setOptions(
            initialOption
              ? [
                  initialOption,
                  ...nextOptions.filter((option) => option.id !== initialOption.id),
                ]
              : nextOptions,
          );
        })
        .catch(() => setOptions([]));
    }, 250);

    return () => clearTimeout(timer);
  }, [entity, initialOption, text]);

  const availableOptions = options.filter(
    (option) => !exclude.includes(String(option.id)),
  );

  const selectedOption = options.find((option) => String(option.id) === value);
  const autoCompleteOptions = availableOptions.map((option) => ({
    value: option.name,
    label: option.code ? `${option.code} · ${option.name}` : option.name,
    id: option.id,
  }));

  return (
    <AutoComplete
      className="lookup-input"
      value={selectedOption?.name ?? text}
      placeholder={`Search ${entity}...`}
      aria-label={`Search ${entity}`}
      options={autoCompleteOptions}
      filterOption={false}
      onSearch={(inputValue: string) => {
        setText(inputValue);
        if (!inputValue) onChange("");
      }}
      onSelect={(_value: string, option: { id?: number }) => {
        onChange(String(option.id ?? ""));
      }}
      onClear={() => {
        setText("");
        onChange("");
      }}
      allowClear
    />
  );
}

export function PrescriptionForm({ initialPatient }: { initialPatient?: Option }) {
  const [pending, startTransition] = useTransition();
  const { control, handleSubmit, register, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      patientId: initialPatient ? String(initialPatient.id) : "",
      diagnosisNotes: "",
      medicines: [
        {
          medicineId: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ],
      tests: [],
    },
  });
  const medicines = useFieldArray({ control, name: "medicines" });
  const tests = useFieldArray({ control, name: "tests" });
  const selectedMedicines = watch("medicines").map((row) => row.medicineId);
  const selectedTests = watch("tests").map((row) => row.testId);

  const submit = (values: FormValues) => {
    if (!values.patientId) {
      toast.error("Please select a patient from the dropdown.");
      return;
    }

    const medicinesToSubmit = values.medicines.filter((row) => row.medicineId);
    const testsToSubmit = values.tests.filter((row) => row.testId);

    if (values.tests.some((row) => !row.testId)) {
      toast.error("Select a test from the dropdown or remove the empty test row.");
      return;
    }

    if (
      values.medicines.some(
        (row) =>
          !row.medicineId &&
          (row.dosage.trim() ||
            row.frequency.trim() ||
            row.duration.trim() ||
            row.instructions.trim()),
      )
    ) {
      toast.error("Select a medicine from the dropdown or clear the empty medicine row.");
      return;
    }

    if (medicinesToSubmit.length === 0 && testsToSubmit.length === 0) {
      toast.error("Add at least one medicine or test.");
      return;
    }

    const incompleteMedicine = medicinesToSubmit.find(
      (row) => !row.dosage.trim() || !row.frequency.trim() || !row.duration.trim(),
    );
    if (incompleteMedicine) {
      toast.error("Complete the dosage, frequency, and duration for each medicine.");
      return;
    }

    const formData = new FormData();
    formData.set("patientId", values.patientId);
    formData.set("diagnosisNotes", values.diagnosisNotes);
    formData.set(
      "medicines",
      JSON.stringify(
        medicinesToSubmit.map((row) => ({ ...row, medicineId: Number(row.medicineId) })),
      ),
    );
    formData.set(
      "tests",
      JSON.stringify(
        testsToSubmit.map((row) => ({ ...row, testId: Number(row.testId) })),
      ),
    );
    startTransition(() => createPrescriptionAction(formData));
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="stack">
      <label className="field-label">
        Patient
        <Lookup
          entity="patients"
          value={watch("patientId")}
          initialOption={initialPatient}
          onChange={(id) => setValue("patientId", id, { shouldValidate: true })}
        />
      </label>

      <label className="field-label">
        Diagnosis / notes
        <textarea {...register("diagnosisNotes")} className="textarea" rows={3} />
      </label>

      <section>
        <div className="section-heading">
          <h3>Medicines</h3>
          <Button
            htmlType="button"
            type="default"
            className="button-secondary"
            onClick={() =>
              medicines.append({
                medicineId: "",
                dosage: "",
                frequency: "",
                duration: "",
                instructions: "",
              })
            }
          >
            Add medicine
          </Button>
        </div>
        {medicines.fields.map((field, index) => (
          <div className="prescription-row" key={field.id}>
            <Lookup
              entity="medicines"
              value={watch(`medicines.${index}.medicineId`)}
              exclude={selectedMedicines.filter((_, i) => i !== index)}
              onChange={(id) => setValue(`medicines.${index}.medicineId`, id)}
            />
            <input
              {...register(`medicines.${index}.dosage`)}
              className="input"
              placeholder="Dosage"
            />
            <input
              {...register(`medicines.${index}.frequency`)}
              className="input"
              placeholder="Frequency"
            />
            <input
              {...register(`medicines.${index}.duration`)}
              className="input"
              placeholder="Duration"
            />
            <input
              {...register(`medicines.${index}.instructions`)}
              className="input"
              placeholder="Instructions"
            />
            <Button
              htmlType="button"
              type="link"
              className="button-danger"
              onClick={() => medicines.remove(index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </section>

      <section>
        <div className="section-heading">
          <h3>Tests</h3>
          <Button
            htmlType="button"
            type="default"
            className="button-secondary"
            onClick={() => tests.append({ testId: "", instructions: "" })}
          >
            Add test
          </Button>
        </div>
        {tests.fields.map((field, index) => (
          <div className="prescription-test-row" key={field.id}>
            <Lookup
              entity="tests"
              value={watch(`tests.${index}.testId`)}
              exclude={selectedTests.filter((_, i) => i !== index)}
              onChange={(id) => setValue(`tests.${index}.testId`, id)}
            />
            <input
              {...register(`tests.${index}.instructions`)}
              className="input"
              placeholder="Instructions"
            />
            <Button
              htmlType="button"
              type="link"
              className="button-danger"
              onClick={() => tests.remove(index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </section>

      <Button className="button" disabled={pending} htmlType="submit">
        {pending ? "Saving..." : "Create prescription"}
      </Button>
    </form>
  );
}
