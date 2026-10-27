import { loginAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">Next Doctor</p>
        <h1 className="page-title">Sign in</h1>
        <p className="page-description">
          Manage your clinic from one secure workspace.
        </p>
        {params.error && <p className="alert-error">Invalid email or password.</p>}
        <form action={loginAction} className="login-form">
          <label className="field-label">
            Email
            <Input name="email" type="email" required />
          </label>
          <label className="field-label">
            Password
            <Input name="password" type="password" required />
          </label>
          <Button htmlType="submit">Sign in</Button>
        </form>
      </section>
    </main>
  );
}
