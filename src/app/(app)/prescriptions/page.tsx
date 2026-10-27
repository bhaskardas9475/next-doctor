import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { DeleteButton } from "@/components/ui/delete-button";
import { ActionToast } from "@/components/ui/action-toast";
import { PrescriptionDialog } from "@/components/features/prescriptions/prescription-dialog";
import { PrescriptionForm } from "@/components/features/prescriptions/prescription-form";
import { deletePrescriptionAction } from "@/server/actions/entities";
import { getPatientById, getPrescriptions } from "@/server/queries/entities";

type SearchParams = Promise<{
  q?: string;
  page?: string;
  pageSize?: string;
  created?: string;
  patientId?: string;
  error?: string;
}>;

export default async function PrescriptionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 10);
  const initialPatient = await getPatientById(Number(params.patientId));
  const { rows, total } = await getPrescriptions(query, page, pageSize);

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Care</p>
        <h1 className="page-title">Prescriptions</h1>
      </header>
      <ActionToast
        success={params.created ? `Created prescription: ${params.created}` : undefined}
        error={params.error}
      />

      {params.created && (
        <p className="alert-success">
          Created {params.created}.{" "}
          <Link href={`/prescriptions/${params.created}/print`} target="_blank">
            Print now
          </Link>
        </p>
      )}

      <section className="card" id="create-prescription">
        <h2 className="card-title">Create prescription</h2>
        <PrescriptionForm
          initialPatient={
            initialPatient
              ? {
                  id: initialPatient.id,
                  name: initialPatient.name,
                  code: initialPatient.code,
                }
              : undefined
          }
        />
      </section>

      <section className="data-card">
        <div className="list-toolbar">
          <h2 className="card-title">Prescription list</h2>
          <SearchInput placeholder="Search number, patient, code..." />
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Prescription #</th>
                <th>Patient</th>
                <th>Medicines</th>
                <th>Tests</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.number}</td>
                  <td>
                    {row.patient.name} <span className="muted">{row.patient.code}</span>
                  </td>
                  <td>{row._count.medicines}</td>
                  <td>{row._count.tests}</td>
                  <td>{row.createdAt.toLocaleDateString()}</td>
                  <td>
                    <div className="toolbar-actions">
                      <PrescriptionDialog prescription={row} />
                      <Link href={`/prescriptions/${row.number}/print`} target="_blank">
                        Print
                      </Link>
                      <DeleteButton
                        id={row.id}
                        label="Prescription"
                        action={deletePrescriptionAction}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="empty-state">No prescriptions found.</p>}
        </div>
        <Pagination page={page} pageSize={pageSize} total={total} query={query} />
      </section>
    </>
  );
}
