"use client";

import { Button, Modal } from "antd";
import { useState } from "react";

type Prescription = {
  number: string;
  patient: { name: string; code: string };
  diagnosisNotes: string | null;
  medicines: Array<{
    medicine: { name: string };
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  tests: Array<{ test: { name: string }; instructions: string | null }>;
};

export function PrescriptionDialog({ prescription }: { prescription: Prescription }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="link" onClick={() => setOpen(true)}>
        View
      </Button>
      <Modal
        open={open}
        title={
          <span>
            {prescription.number} · {prescription.patient.name}
          </span>
        }
        onCancel={() => setOpen(false)}
        footer={[
          <Button key="close" onClick={() => setOpen(false)}>
            Close
          </Button>,
          <Button
            key="print"
            type="primary"
            href={`/prescriptions/${prescription.number}/print`}
            target="_blank"
          >
            Print
          </Button>,
        ]}
      >
        <p className="muted">{prescription.patient.code}</p>
        <p>{prescription.diagnosisNotes ?? "No diagnosis notes."}</p>
        <h3>Medicines</h3>
        <ul className="dialog-list">
          {prescription.medicines.map((item) => (
            <li key={item.medicine.name}>
              {item.medicine.name} · {item.dosage} · {item.frequency} · {item.duration}
            </li>
          ))}
        </ul>
        <h3>Tests</h3>
        <ul className="dialog-list">
          {prescription.tests.map((item) => (
            <li key={item.test.name}>
              {item.test.name}
              {item.instructions ? ` · ${item.instructions}` : ""}
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
