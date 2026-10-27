import { Pagination } from "@/components/ui/pagination";
import { ActionToast } from "@/components/ui/action-toast";
import { SearchInput } from "@/components/ui/search-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { createMedicineAction, deleteMedicineAction } from "@/server/actions/entities";
import { getMedicines } from "@/server/queries/entities";

type SearchParams = Promise<{
  q?: string;
  page?: string;
  pageSize?: string;
  created?: string;
  error?: string;
}>;

export default async function MedicinesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 10);
  const { rows, total } = await getMedicines(query, page, pageSize);

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Catalog</p>
        <h1 className="page-title">Medicines</h1>
      </header>
      <ActionToast
        success={params.created ? `Added medicine: ${params.created}` : undefined}
        error={params.error}
      />

      <section className="card">
        <h2 className="card-title">Add medicine</h2>
        <form action={createMedicineAction} className="form-grid">
          <Input name="name" placeholder="Name" required />
          <Input name="dosageFormStrength" placeholder="Dosage / strength" />
          <Input name="notes" placeholder="Notes" />
          <Button htmlType="submit">Add medicine</Button>
        </form>
      </section>

      <section className="data-card">
        <div className="list-toolbar">
          <h2 className="card-title">Medicine list</h2>
          <SearchInput placeholder="Search medicines..." />
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Dosage / strength</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(
                (row: {
                  id: number;
                  name: string;
                  dosageFormStrength: string | null;
                  notes: string | null;
                }) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.dosageFormStrength ?? "—"}</td>
                    <td>{row.notes ?? "—"}</td>
                    <td>
                      <DeleteButton id={row.id} label="Medicine" action={deleteMedicineAction} />
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
          {rows.length === 0 && <p className="empty-state">No medicines found.</p>}
        </div>
        <Pagination page={page} pageSize={pageSize} total={total} query={query} />
      </section>
    </>
  );
}
