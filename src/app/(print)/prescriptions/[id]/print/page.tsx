import Link from "next/link";
import { notFound } from "next/navigation";
import { clinic } from "@/config/clinic";
import { PrintButton } from "@/components/features/prescriptions/print-button";
import { prisma } from "@/lib/db";

export default async function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prescription = await prisma.prescription.findUnique({
    where: { number: id },
    include: {
      patient: true,
      medicines: { include: { medicine: true } },
      tests: { include: { test: true } },
    },
  });

  if (!prescription) notFound();

  return (
    <main className="print-page">
      <div className="print-toolbar no-print">
        <Link href="/prescriptions" className="button-secondary">
          Back
        </Link>
        <PrintButton />
      </div>
      <header className="print-header">
        <h1>{clinic.name}</h1>
        <p>
          {clinic.doctor} · {clinic.qualification}
        </p>
        <p>Registration: {clinic.registration}</p>
        <p>
          {clinic.address} · {clinic.phone}
        </p>
      </header>
      <div className="print-meta">
        <div>
          <strong>Prescription:</strong> {prescription.number}
          <br />
          <strong>Date:</strong> {prescription.createdAt.toLocaleDateString()}
        </div>
        <div>
          <strong>Patient:</strong> {prescription.patient.name}
          <br />
          {prescription.patient.code} · {prescription.patient.age} years ·{" "}
          {prescription.patient.gender}
        </div>
      </div>
      {prescription.diagnosisNotes && (
        <section>
          <h2>Diagnosis / notes</h2>
          <p>{prescription.diagnosisNotes}</p>
        </section>
      )}
      <section>
        <h2>Medicines</h2>
        <table className="print-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Medicine</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medicines.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.medicine.name}</td>
                <td>{item.dosage}</td>
                <td>{item.frequency}</td>
                <td>{item.duration}</td>
                <td>{item.instructions ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2>Tests</h2>
        <ul>
          {prescription.tests.map((item) => (
            <li key={item.id}>
              {item.test.name}
              {item.instructions ? ` — ${item.instructions}` : ""}
            </li>
          ))}
        </ul>
      </section>
      <footer className="signature">Doctor signature</footer>
    </main>
  );
}
