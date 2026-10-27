import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function Dashboard() {
  const [patients, medicines, tests, prescriptions] = await Promise.all([
    prisma.patient.count(),
    prisma.medicine.count(),
    prisma.test.count(),
    prisma.prescription.count(),
  ]);
  const tiles = [
    ["Patients", patients, "/patients", "Manage patient records"],
    ["Medicines", medicines, "/medicines", "Maintain your formulary"],
    ["Tests", tests, "/tests", "Manage diagnostic tests"],
    [
      "Prescriptions",
      prescriptions,
      "/prescriptions",
      "Create and print prescriptions",
    ],
  ];
  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Overview</p>
        <h1 className="page-title">Good morning, Doctor</h1>
        <p className="page-description">Your clinic at a glance.</p>
      </header>
      <div className="dashboard-grid">
        {tiles.map(([label, count, href, description]) => (
          <Link href={String(href)} key={String(label)} className="dashboard-tile">
            <p className="tile-label">{label}</p>
            <p className="tile-count">{count}</p>
            <p className="tile-description">{description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
