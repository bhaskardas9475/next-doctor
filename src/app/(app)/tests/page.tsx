import { Pagination } from "@/components/ui/pagination";
import { ActionToast } from "@/components/ui/action-toast";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { createTestAction, deleteTestAction } from "@/server/actions/entities";
import { getTests } from "@/server/queries/entities";

type SearchParams = Promise<{
  q?: string;
  page?: string;
  pageSize?: string;
  created?: string;
  error?: string;
}>;

export default async function TestsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 10);
  const { rows, total } = await getTests(query, page, pageSize);

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Catalog</p>
        <h1 className="page-title">Tests</h1>
      </header>
      <ActionToast
        success={params.created ? `Added test: ${params.created}` : undefined}
        error={params.error}
      />

      <section className="card">
        <h2 className="card-title">Add test</h2>
        <form action={createTestAction} className="form-grid">
          <input className="input" name="name" placeholder="Test name" required />
          <input className="input" name="description" placeholder="Description" />
          <span />
          <Button htmlType="submit">Add test</Button>
        </form>
      </section>

      <section className="data-card">
        <div className="list-toolbar">
          <h2 className="card-title">Test list</h2>
          <SearchInput placeholder="Search tests..." />
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.description ?? "—"}</td>
                  <td>
                    <DeleteButton id={row.id} label="Test" action={deleteTestAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="empty-state">No tests found.</p>}
        </div>
        <Pagination page={page} pageSize={pageSize} total={total} query={query} />
      </section>
    </>
  );
}
