import { PatientDialog } from "@/components/features/patients/patient-dialog";
import { ActionToast } from "@/components/ui/action-toast";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { createPatientAction, deletePatientAction } from "@/server/actions/entities";
import { getPatients } from "@/server/queries/entities";

type SearchParams = Promise<{
  q?: string;
  page?: string;
  pageSize?: string;
  created?: string;
  error?: string;
}>;

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 10);
  const { rows, total } = await getPatients(query, page, pageSize);

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">People</p>
        <h1 className="page-title">Patients</h1>
      </header>
      <ActionToast
        success={params.created ? `Added patient: ${params.created}` : undefined}
        error={params.error}
      />

      <section className="card">
        <h2 className="card-title">Add patient</h2>
        <form action={createPatientAction} className="form-grid">
          <input className="input" name="name" placeholder="Full name" required />
          <input
            className="input"
            name="age"
            type="number"
            min="0"
            max="150"
            placeholder="Age"
            required
          />
          <Select
            name="gender"
            placeholder="Gender"
            options={[
              { label: "Female", value: "Female" },
              { label: "Male", value: "Male" },
              { label: "Other", value: "Other" },
            ]}
          />
          <input className="input" name="phone" placeholder="Phone" />
          <input className="input" name="notes" placeholder="Notes" />
          <span />
          <span />
          <Button htmlType="submit">Add patient</Button>
        </form>
      </section>

      <section className="data-card">
        <div className="list-toolbar">
          <h2 className="card-title">Patient list</h2>
          <SearchInput placeholder="Search name, code, phone..." />
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.code}</td>
                  <td>{row.name}</td>
                  <td>{row.age}</td>
                  <td>{row.gender}</td>
                  <td>{row.phone ?? "—"}</td>
                  <td>
                    <div className="toolbar-actions">
                      <PatientDialog patient={row} />
                      <Button
                        type="link"
                        href={`/prescriptions?patientId=${row.id}#create-prescription`}
                      >
                        Create prescription
                      </Button>
                      <Button
                        type="link"
                        href={`/prescriptions?q=${encodeURIComponent(row.code)}`}
                      >
                        Prescriptions
                      </Button>
                      <DeleteButton id={row.id} label="Patient" action={deletePatientAction} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="empty-state">No patients found.</p>}
        </div>
        <Pagination page={page} pageSize={pageSize} total={total} query={query} />
      </section>
    </>
  );
}
