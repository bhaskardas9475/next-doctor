# Next Doctor

Next Doctor is a local-first clinic management app built with Next.js App Router, Prisma, SQLite, TypeScript, Ant Design, Zod, and signed-cookie sessions. Styling is maintained in semantic CSS; Tailwind is not required.

## Local setup

1. Install Node.js 22 and Yarn.
2. Install dependencies:

   ```bash
   yarn install
   ```

3. Create `.env` from `.env.example` and set a long `SESSION_SECRET`.
4. Generate the Prisma client, create a development migration, and seed demo data:

   ```bash
   yarn prisma:generate
   yarn prisma:migrate --name init
   yarn prisma:seed
   ```

5. Start the app:

   ```bash
   yarn dev
   ```

Open http://localhost:3000. The default credentials are the values in `.env.example`: `doctor@example.com` / `change-me`. Change them before production use.

## Features

- Signed, httpOnly session cookie authentication with protected routes.
- Dashboard counts and responsive sidebar navigation.
- Searchable, URL-persisted, paginated medicine, test, patient, and prescription lists.
- Prisma transaction-backed patient (`PT-0001`) and prescription (`RX-0001`) serial numbers.
- Prescription creation with repeatable medicines and tests, duplicate prevention, validation, detail dialog, and print view.
- Health endpoint at `/api/health` for the Windows launcher.

## Print header

Set `CLINIC_NAME`, `DOCTOR_NAME`, `DOCTOR_QUALIFICATION`, `DOCTOR_REGISTRATION`, `CLINIC_ADDRESS`, and `CLINIC_PHONE` in `.env`. Defaults are also defined in [src/config/clinic.ts](./src/config/clinic.ts).

## Architecture

Server Components load data through [src/lib/db.ts](./src/lib/db.ts) and query functions under `src/server/queries`. Server Actions under `src/server/actions` validate input with shared Zod schemas and perform mutations. The Prisma schema and seed data live in `prisma/`. The authenticated shell is a route-group layout, while the print route has a minimal layout and print-specific CSS.

## Windows installer

The workflow at `.github/workflows/windows-installer.yml` builds the standalone Next.js server, generates and seeds Prisma, bundles a portable Node.js runtime, and publishes `setup.exe` as a GitHub Actions artifact. The installer launches the app through `packaging/launch.ps1` and does not require Node.js to be installed on the user's machine.
