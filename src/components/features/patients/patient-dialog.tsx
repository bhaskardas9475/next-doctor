"use client";

import { Modal } from "antd";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Patient = {
  code: string;
  name: string;
  age: number;
  gender: string;
  phone: string | null;
  notes: string | null;
};

export function PatientDialog({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="link" onClick={() => setOpen(true)}>
        View
      </Button>
      <Modal
        open={open}
        title={`${patient.name} · ${patient.code}`}
        onCancel={() => setOpen(false)}
        footer={
          <Button onClick={() => setOpen(false)}>
            Close
          </Button>
        }
      >
        <dl className="detail-list">
          <div>
            <dt>Age</dt>
            <dd>{patient.age}</dd>
          </div>
          <div>
            <dt>Gender</dt>
            <dd>{patient.gender}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{patient.phone ?? "—"}</dd>
          </div>
          <div>
            <dt>Notes</dt>
            <dd>{patient.notes ?? "No notes."}</dd>
          </div>
        </dl>
      </Modal>
    </>
  );
}
